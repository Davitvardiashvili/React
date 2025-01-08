import axios from "axios";
import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance/axiosInstance";
import { notifyError, notifySuccess } from "../App";
import { Button, Table, Form, Container, Row, Col } from "react-bootstrap";
import { globalUrl } from "../App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilePdf,
  faArrowDown19,
  faShirt,
  faArrowDownUpAcrossLine,
  faCloudArrowUp
} from "@fortawesome/free-solid-svg-icons";

import CompetitionDayChooser from "./CompetitionDayChooser"; 
// a centered arrow-based or pill-based day chooser from your 'Cart' approach

const Results = () => {
  /**************************************************************************
   * 1) State for CompetitionDay-based approach
   **************************************************************************/
  const [competitionDays, setCompetitionDays] = useState([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(-1);

  // The results from the server for the selected day
  const [results, setResults] = useState([]);

  // Grouped results for display => { groupKey: { ageGroup, items: [...] } }
  const [groupMap, setGroupMap] = useState([]);

  // For editing run times
  const [editedRuns, setEditedRuns] = useState({});

  // For sorting approach: "bib" or "place"
  const [sortMethod, setSortMethod] = useState("bib");

  // For collecting IDs for e.g. PDF download
  const [sortedResultIds, setSortedResultIds] = useState([]);

  /**************************************************************************
   * 2) Fetch all CompetitionDay once, set default to the latest
   **************************************************************************/
  useEffect(() => {
    axios
      .get(`${globalUrl.url}/api/competition-day/`)
      .then((response) => {
        let days = response.data;
        // Sort ascending
        days.sort((a, b) => (a.date < b.date ? -1 : 1));
        setCompetitionDays(days);

        // Default: pick the latest day
        if (days.length > 0) {
          setCurrentDayIndex(days.length - 1);
        }
      })
      .catch((error) => {
        console.error("Error fetching competition days:", error);
      });
  }, []);

  /**************************************************************************
   * 3) Derive currentDay & fetch results for that date
   **************************************************************************/
  const currentDay =
    currentDayIndex >= 0 && currentDayIndex < competitionDays.length
      ? competitionDays[currentDayIndex]
      : null;

  useEffect(() => {
    if (!currentDay) return;

    // GET /api/results?date=YYYY-MM-DD
    axios
      .get(`${globalUrl.url}/api/results?date=${currentDay.date}`)
      .then((res) => {
        setResults(res.data);
      })
      .catch((err) => {
        console.error("Error fetching results for day:", err);
      });
  }, [currentDay]);

  /**************************************************************************
   * 4) Group results by AgeGroup => a stable key => (gender=ქალი / კაცი)
   *    Then sort female groups first, from youngest->oldest, then male from youngest->oldest
   **************************************************************************/
  function getGroupKey(ageGroup) {
    // We'll define a key that includes its ID or manually:
    // e.g. if (gender=ქალი, start=2010, end=2011) => "ქალი(2010-2011)"
    if (!ageGroup) return "Unknown Group";

    // e.g. 'ქალი' or 'კაცი'
    let g = ageGroup.gender;
    let start = ageGroup.birth_year_start;
    let end = ageGroup.birth_year_end;

    let label = g === "ქალი" ? "ქალი" : "კაცი";
    if (start == null && end == null) {
      label += " None";
    } else if (start == null && end != null) {
      label += ` None-${end}`;
    } else if (start != null && end == null) {
      label += ` ${start}+`;
    } else {
      label += ` ${start}-${end}`;
    }
    return label;
  }

  /**************************************************************************
   * Sorting AgeGroup: female first => male second,
   * within each gender => descending birth_year_start => youngest->oldest
   **************************************************************************/
  function ageGroupSortFunc(a, b) {
    // 'a' and 'b' are the "Group" objects => { ageGroup, items: [...] }
    // or if you're just sorting by the key, we'll store data on the object
    const agA = a.ageGroup;
    const agB = b.ageGroup;

    // 0 => female, 1 => male
    let genderA = agA.gender === "ქალი" ? 0 : 1;
    let genderB = agB.gender === "ქალი" ? 0 : 1;
    if (genderA !== genderB) {
      return genderA - genderB; // female first => 0 < 1
    }

    // same gender => compare birth_year_start descending
    let startA = agA.birth_year_start || 0;
    let startB = agB.birth_year_start || 0;
    return startB - startA; 
  }

  // Sort "items" in each group by your chosen method => place or bib
  function sortItemsInGroup(items, method) {
    if (method === "place") {
      // place = null => treat as large
      return [...items].sort((a, b) => {
        let pa = a.place ?? 999999;
        let pb = b.place ?? 999999;
        return pa - pb;
      });
    } else {
      // sort by bib => a.registration.bib_number
      return [...items].sort((a, b) => {
        let ba = a.registration.bib_number ?? 0;
        let bb = b.registration.bib_number ?? 0;
        return ba - bb;
      });
    }
  }

  /**************************************************************************
   * 5) Re-group + re-sort whenever 'results' or 'sortMethod' changes
   **************************************************************************/
  useEffect(() => {
    // Build map: { groupKey => { ageGroup, items: [] } }
    let tempMap = {};

    results.forEach((r) => {
      const ageGroup = r.registration.age_group;
      const groupKey = getGroupKey(ageGroup);

      if (!tempMap[groupKey]) {
        tempMap[groupKey] = {
          ageGroup,
          items: [],
        };
      }
      tempMap[groupKey].items.push(r);
    });

    // Convert that map => array so we can sort by "ageGroupSortFunc"
    let groupArray = Object.keys(tempMap).map((key) => ({
      key, // "ქალი 2010-2011" etc.
      ageGroup: tempMap[key].ageGroup,
      items: tempMap[key].items,
    }));

    // sort the groupArray => female first => male second => youngest->oldest
    groupArray.sort(ageGroupSortFunc);

    // now sort each group's items by sortMethod
    groupArray.forEach((g) => {
      g.items = sortItemsInGroup(g.items, sortMethod);
    });

    // Also collect IDs for e.g. PDF download
    let allIds = [];
    groupArray.forEach((g) => {
      g.items.forEach((item) => allIds.push(item.id));
    });
    setSortedResultIds(allIds);
    setGroupMap(groupArray);

  }, [results, sortMethod]);

  /**************************************************************************
   * 6) For toggling bib vs place
   **************************************************************************/
  function handleSortSwitch() {
    setSortMethod((prev) => (prev === "bib" ? "place" : "bib"));
  }

  /**************************************************************************
   * 7) Optionally flipping top 5 in a group
   **************************************************************************/
  function handleSortGroupByPlace(groupIndex) {
    // flip top 5
    const newMap = [...groupMap];
    const group = newMap[groupIndex];
    const sorted = sortItemsInGroup(group.items, "place");

    const reversedFirstFive = sorted.slice(0, 5).reverse();
    const rest = sorted.slice(5);
    group.items = reversedFirstFive.concat(rest);

    // rebuild allIds
    let allIds = [];
    newMap.forEach((g) => g.items.forEach((i) => allIds.push(i.id)));
    setSortedResultIds(allIds);

    setGroupMap(newMap);
  }

  function handleSortGroupByPlaceNormally(groupIndex) {
    const newMap = [...groupMap];
    const group = newMap[groupIndex];
    group.items = sortItemsInGroup(group.items, "place");

    let allIds = [];
    newMap.forEach((g) => g.items.forEach((i) => allIds.push(i.id)));
    setSortedResultIds(allIds);

    setGroupMap(newMap);
  }

  function handleSortGroupByBib(groupIndex) {
    const newMap = [...groupMap];
    const group = newMap[groupIndex];
    group.items = sortItemsInGroup(group.items, "bib");

    let allIds = [];
    newMap.forEach((g) => g.items.forEach((i) => allIds.push(i.id)));
    setSortedResultIds(allIds);

    setGroupMap(newMap);
  }

  /**************************************************************************
   * 8) Editing runs => handleRunChange & handleUpdate
   **************************************************************************/
  function handleRunChange(resultId, field, value) {
    setEditedRuns((prev) => ({
      ...prev,
      [resultId]: {
        ...prev[resultId],
        [field]: value,
      },
    }));
  }

  async function handleUpdate(resultId) {
    try {
      const { run1_time, run2_time } = editedRuns[resultId] || {};

      // PUT /results/<id> with run1_time, run2_time
      await axiosInstance.put(`/results/${resultId}/`, { run1_time, run2_time });

      notifySuccess("Results updated successfully", "success");

      // re-fetch current day results
      if (currentDay) {
        const response = await axios.get(`${globalUrl.url}/api/results?date=${currentDay.date}`);
        setResults(response.data);
      }
    } catch (error) {
      console.error("Error updating record:", error);
      notifyError("Error occurred while updating results", "error");
    }
  }

  /**************************************************************************
   * 9) Download PDF
   **************************************************************************/
  function handleDownloadPDF() {
    if (sortedResultIds.length === 0) {
      notifyError("No results to download for this day", "error");
      return;
    }

    axiosInstance
      .post(
        "/download_results_pdf/",
        { resultIds: sortedResultIds },
        { responseType: "blob" }
      )
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Results_${currentDay?.date}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Error downloading PDF file:", error);
        notifyError("Failed to download PDF file", "error");
      });
  }

  /**************************************************************************
   * Render
   **************************************************************************/
  const columnStyles = { width: "250px" };
  const paddingCol = { paddingLeft: "2rem" };



  let competitionName = "";
  if (currentDay) {
    const { date, discipline, stage } = currentDay;
    const dateString  = new Date(date);

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(dateString);
    console.log(formattedDate)
    if (discipline && stage) {
      competitionName = `${formattedDate}  ${stage.name} ${stage.location} - ${discipline.name}`;
    } else {
      competitionName = date;
    }
  }

  return (
    <Container className="resultsTable lubric">
      


      <Row className="competition-info-panel">
        <Row>
        <CompetitionDayChooser
          competitionDays={competitionDays}
          currentDayIndex={currentDayIndex}
          setCurrentDayIndex={setCurrentDayIndex}
        />

        </Row>
        <Row className="mt-3 down-lubric">
        <Col>
              <div style={{color:'white'}}>{competitionName}</div>
        </Col>
        <Col>
          <Button
            variant={sortMethod === "bib" ? "primary" : "success"}
            onClick={handleSortSwitch}
          >
            <FontAwesomeIcon icon={sortMethod === "bib" ? faArrowDown19 : faShirt} className="me-2" />
            {`Sort by ${sortMethod === "bib" ? "Place" : "BIB"}`}
          </Button>

          <Button variant="danger" className="ms-2" onClick={handleDownloadPDF}>
            <FontAwesomeIcon icon={faFilePdf} className="me-2" />
            PDF - Result List
          </Button>
        </Col>
        </Row>

      </Row>



      <Row className="down-lubric"> 
       <Row className="lubric3">


        {groupMap.map((groupObj, index) => {
          const groupName = getGroupKey(groupObj.ageGroup); // e.g. "ქალი 2010-2011"
          return (
            <div key={groupName} className="mt-4">
              <h4 className="group-name mb-3">{groupName}</h4>

              {/* Buttons to sort this group specifically */}
              <Button variant="primary" onClick={() => handleSortGroupByPlaceNormally(index)}>
                <FontAwesomeIcon icon={faArrowDown19} className="me-2" />
                Sort Group by Place
              </Button>
              <Button variant="success" className="ms-2" onClick={() => handleSortGroupByBib(index)}>
                <FontAwesomeIcon icon={faShirt} className="me-2" />
                Sort Group by BIB
              </Button>
              <Button
                variant="info"
                className="ms-2"
                style={{ backgroundColor: "#4d1d99", borderColor: "#4d1d99" }}
                onClick={() => handleSortGroupByPlace(index)}
              >
                <FontAwesomeIcon icon={faArrowDownUpAcrossLine} className="me-2" />
                Sort Group by Flip
              </Button>

              <Table hover className="mt-3">
                <thead>
                  <tr>
                    <th style={paddingCol}>Rank</th>
                    <th>Bib</th>
                    <th style={columnStyles}>სპორტსმენი</th>
                    <th>დაბ.წელი</th>
                    <th>სკოლა</th>
                    <th>დრო 1</th>
                    <th>დრო 2</th>
                    <th>მოქმედება</th>
                    <th>ჯამური დრო</th>
                    <th>ქულა</th>
                    <th>სეზონის ქულა</th>
                  </tr>
                </thead>
                <tbody>
                  {groupObj.items.map((result) => {
                    const reg = result.registration;
                    const competitor = reg.competitor;
                    const rid = result.id;

                    return (
                      <tr key={rid}>
                        <td style={{ paddingLeft: "3rem" }} className="align-middle place">
                          {result.place}
                        </td>
                        <td className="align-middle bib">{reg.bib_number}</td>
                        <td className="align-middle atlet">
                          {competitor.first_name} {competitor.last_name}
                        </td>
                        <td className="align-middle">{competitor.year_of_birth}</td>
                        <td className="align-middle">{competitor.school}</td>
                        <td className="align-middle">
                          <Form.Control
                            type="text"
                            value={
                              editedRuns[rid]?.run1_time !== undefined
                                ? editedRuns[rid]?.run1_time
                                : result.run1_time || ""
                            }
                            onChange={(e) => handleRunChange(rid, "run1_time", e.target.value)}
                            placeholder="00:00,00"
                            maxLength={8}
                          />
                        </td>
                        <td className="align-middle">
                          <Form.Control
                            type="text"
                            value={
                              editedRuns[rid]?.run2_time !== undefined
                                ? editedRuns[rid]?.run2_time
                                : result.run2_time || ""
                            }
                            onChange={(e) => handleRunChange(rid, "run2_time", e.target.value)}
                            placeholder="00:00,00"
                            maxLength={8}
                          />
                        </td>
                        <td className="align-middle">
                          <Button variant="warning" onClick={() => handleUpdate(rid)}>
                            <FontAwesomeIcon icon={faCloudArrowUp} className="me-2" />
                            შენახვა
                          </Button>
                        </td>
                        <td className="align-middle totaltime">{result.total_time}</td>
                        <td className="align-middle">{result.points}</td>
                        <td className="align-middle">{result.season_points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          );
        })}
        </Row>
      </Row>

      {/* Render groupMap => array of objects => groupMap[i].items */}

    </Container>
  );
};

export default Results;
