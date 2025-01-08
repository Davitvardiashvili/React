import axios from "axios";
import React, { useEffect, useState } from "react";
import "./css/cart.css";
import axiosInstance from "../axiosInstance/axiosInstance";
import { notifyError, notifySuccess } from "../App";
import { Button, Table, Form, Container, Row, Col, ButtonGroup, ToggleButton } from "react-bootstrap";
import { globalUrl } from "../App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDice,
  faFileExcel,
  faFilePdf,
  faRotate,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import CompetitionDayChooser from "./CompetitionDayChooser"; // or wherever you keep it



const Cart = () => {
  // ---------------------------
  // State
  // ---------------------------
  // 1) CompetitionDays arrow-based selection
  const [competitionDays, setCompetitionDays] = useState([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(-1);

  // 2) Competitors
  const [competitorTable, setCompetitorTable] = useState([]);
  const [originalCompetitorTable, setOriginalCompetitorTable] = useState([]);

  // 3) Registration
  const [registrationMembers, setRegistrationMembers] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);

  // 4) Randomize fields
  const [startNumber, setStartNumber] = useState(1);
  const [ignoreNumbers, setIgnoreNumbers] = useState([]);
  const [selectedGender, setSelectedGender] = useState("2");

  // 5) Filtering
  const [filterGender, setFilterGender] = useState("");
  const [filterYearStart, setFilterYearStart] = useState("");
  const [filterYearEnd, setFilterYearEnd] = useState("");
  const [filterName, setFilterName] = useState("");

  // (Optional) Drag/Drop references
  const [draggedGroup, setDraggedGroup] = useState(null);

  // ---------------------------
  // Fetch competition days
  // ---------------------------
  useEffect(() => {
    axios
      .get(`${globalUrl.url}/api/competition-day/`)
      .then((response) => {
        const days = [...response.data];
        // Sort by date ascending
        days.sort((a, b) => (a.date < b.date ? -1 : 1));

        setCompetitionDays(days);
        // Default to the "latest" day
        if (days.length > 0) {
          setCurrentDayIndex(days.length - 1);
        }
      })
      .catch((error) => {
        console.error("Error fetching competition days:", error);
      });
  }, []);

  // ---------------------------
  // Fetch competitors, registrations, ageGroups
  // ---------------------------
  useEffect(() => {
    // Competitors
    axios
      .get(`${globalUrl.url}/api/competitor/`)
      .then((response) => {
        const fetched = response.data;
        setOriginalCompetitorTable(fetched);

        // If you had localStorage merges
        const storedCompetitorTable =
          JSON.parse(localStorage.getItem("competitorTable")) || [];
        const merged = [
          ...fetched,
          ...storedCompetitorTable.filter(
            (storedCompetitor) =>
              !fetched.some(
                (fetchedCompetitor) => fetchedCompetitor.id === storedCompetitor.id
              )
          ),
        ];
        setCompetitorTable(merged);
      })
      .catch((error) => {
        console.error("Error fetching competitor data:", error);
      });

    // Registration
    

    // AgeGroups
    axios
      .get(`${globalUrl.url}/api/age-group/`)
      .then((response) => {
        setAgeGroups(response.data);
      })
      .catch((error) => {
        console.error("Error fetching age groups:", error);
      });
  }, []);




  // ---------------------------
  // currentDay derived
  // ---------------------------
  const currentDay =
    currentDayIndex >= 0 && currentDayIndex < competitionDays.length
      ? competitionDays[currentDayIndex]
      : null;

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


  useEffect(() => {
    if (!currentDay) return;
    
    axios
      .get(`${globalUrl.url}/api/registration/?date=${currentDay.date}`)
      .then((response) => {
        setRegistrationMembers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching registration data:", error);
      });
  }, [currentDay]); // re-run whenever currentDay changes
  



  // ---------------------------
  // Filtered competitor list
  // ---------------------------
  // We want to exclude any competitor who is ALREADY registered for currentDay
  // Then we apply the filterGender, year, name
  const filteredCompetitors = competitorTable.filter((competitor) => {
    // 1) If there's a day selected, exclude competitor if they're in that day's registrations
    if (currentDay) {
      const isRegisteredForThisDay = registrationMembers.some(
        (reg) =>
          reg.competition_day.id === currentDay.id &&
          reg.competitor.id === competitor.id
      );
      if (isRegisteredForThisDay) {
        return false;
      }
    }

    // 2) Filter by gender
    if (filterGender && competitor.gender !== filterGender) {
      return false;
    }

    // 3) Filter by birth year range
    if (filterYearStart && competitor.year_of_birth < parseInt(filterYearStart)) {
      return false;
    }
    if (filterYearEnd && competitor.year_of_birth > parseInt(filterYearEnd)) {
      return false;
    }

    // 4) Filter by name
    if (filterName) {
      const fullName = competitor.first_name + " " + competitor.last_name;
      if (!fullName.toLowerCase().includes(filterName.toLowerCase())) {
        return false;
      }
    }

    return true;
  });



  // ---------------------------
  // findMatchingAgeGroup
  // ---------------------------
  function findMatchingAgeGroup(competitor, ageGroups, currentDay) {
    if (!currentDay?.stage?.season) return null;

    const seasonId = currentDay.stage.season.id;
    const competitorGender = competitor.gender;
    const competitorYear = competitor.year_of_birth;

    const possibleGroups = ageGroups.filter((ag) => {
      if (ag.season.id !== seasonId) return false;
      if (ag.gender !== competitorGender) return false;

      // birth_year_start
      if (ag.birth_year_start && competitorYear < ag.birth_year_start) {
        return false;
      }
      // birth_year_end
      if (ag.birth_year_end && competitorYear > ag.birth_year_end) {
        return false;
      }
      return true;
    });

    if (possibleGroups.length === 0) return null;
    // pick the first or define a better tie-break
    return possibleGroups[0];
  }

  // ---------------------------
  // "Add" competitor
  // ---------------------------
  const handleAddCompetitor = (competitor) => {
    if (!currentDay) {
      notifyError("გთხოვთ ჯერ აირჩიეთ შეჯიბრის დღე", "error");
      return;
    }

    // find age group
    const matchedAG = findMatchingAgeGroup(competitor, ageGroups, currentDay);
    if (!matchedAG) {
      notifyError("No suitable AgeGroup found for this competitor", "error");
      return;
    }

    // payload
    const payload = {
      competition_day_id: currentDay.id,
      competitor_id: competitor.id,
      age_group_id: matchedAG.id,
    };

    axiosInstance
      .post("/registration/", payload)
      .then(() => {
        notifySuccess("Added competitor successfully", "success");

        // re-fetch registrations
        axios
          .get(`${globalUrl.url}/api/registration/?date=${currentDay.date}`)
          .then((res) => {
            setRegistrationMembers(res.data);
          })
          .catch((err) => console.error("Error fetching regs:", err));

        // remove from left table
        setCompetitorTable((prev) =>
          prev.filter((c) => c.id !== competitor.id)
        );
      })
      .catch((error) => {
        console.error("Error adding competitor:", error);
        notifyError("დაფიქსირდა შეცდომა სპორტსმენის დამატებისას", "error");
      });
  };

  // ---------------------------
  // Right side: AgeGroup tables
  // ---------------------------
  function renderAgeGroupTables() {
    if (!currentDay?.stage?.season) return null;
    const seasonId = currentDay.stage.season.id;

    // Sort age groups so that younger females on top => older females => younger males => older males
    // We'll define a custom function or do a two-phase approach. For simpler logic:
    // "ქალი" < "კაცი", then sort birth_year_start desc
    const sortedAG = [...ageGroups]
      .filter((ag) => ag.season.id === seasonId)
      .sort((a, b) => {
        // 1) Females first
        if (a.gender === "ქალი" && b.gender === "კაცი") return -1;
        if (a.gender === "კაცი" && b.gender === "ქალი") return 1;

        // 2) Both same gender => compare birth_year_start desc
        const aStart = a.birth_year_start || 0;
        const bStart = b.birth_year_start || 0;
        return bStart - aStart; // "younger" => bigger start => earlier
      });

    return sortedAG.map((ag) => {
      // filter registrations
      const groupRegs = registrationMembers.filter(
        (reg) =>
          reg.competition_day.id === currentDay.id && reg.age_group.id === ag.id
      );
      if (groupRegs.length === 0) return null;

      // Show arrow-down if birth_year_start is null
      let yearRangeStr = "";
      if (!ag.birth_year_start) {
        yearRangeStr = "↓ - " + ag.birth_year_end; 
      } else if (ag.birth_year_end) {
        yearRangeStr = `${ag.birth_year_start} - ${ag.birth_year_end}`;
      } else {
        yearRangeStr = `${ag.birth_year_start}+`;
      }

      return (
        <div key={ag.id} style={{ marginTop: "2rem" }}>
          <h5>
            {ag.gender} | {yearRangeStr}
          </h5>
          <Table hover>
            <thead>
              <tr>
                <th>BIB</th>
                <th style={columnStyles}>სახელი გვარი</th>
                <th>სქესი</th>
                <th>წელი</th>
                <th>სკოლა</th>
                <th>მოქმედება</th>
              </tr>
            </thead>
            <tbody>
              {groupRegs
                .sort((x, y) => (x.bib_number || 0) - (y.bib_number || 0))
                .map((registration) => (
                  <tr key={registration.id}>
                    <td>{registration.bib_number}</td>
                    <td>
                      {registration.competitor.first_name}{" "}
                      {registration.competitor.last_name}
                    </td>
                    <td>{registration.competitor.gender}</td>
                    <td>{registration.competitor.year_of_birth}</td>
                    <td>{registration.competitor.school}</td>
                    <td>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteCompetitor(registration.id)}
                      >
                        ამოშლა
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>
      );
    });
  }


  // 1) Download Excel
  const handleDownloadExcel = () => {
    // 1) Gather registration IDs from your 'registrationMembers'
    const registrationIds = registrationMembers.map(reg => reg.id);

    if (!registrationIds.length) {
      notifyError("No registrations found for the current day", "error");
      return;
    }

    // 2) Send POST to /download_excel/
    axiosInstance.post('/download_excel/', 
      { registrationIds },
      { responseType: 'blob' }  // so we can create a downloadable file
    )
    .then(response => {
      // 3) Create a blob and link to download
      const url = window.URL.createObjectURL(new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'StartList.xlsx'); // the filename
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    })
    .catch(error => {
      console.error("Error downloading Excel file:", error);
      notifyError("Failed to download Excel file", "error");
    });
  };

  // 2) Download PDF
  const handleDownloadPDF = () => {
    const registrationIds = registrationMembers.map(reg => reg.id);

    if (!registrationIds.length) {
      notifyError("No registrations found for the current day", "error");
      return;
    }

    axiosInstance.post('/download_pdf/',
      { registrationIds },
      { responseType: 'blob' }
    )
    .then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data], {
        type: 'application/pdf'
      }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'StartList.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    })
    .catch(error => {
      console.error("Error downloading PDF file:", error);
      notifyError("Failed to download PDF file", "error");
    });
  };


  // ---------------------------
  // Delete competitor => remove from registration
  // ---------------------------
  const handleDeleteCompetitor = (registrationId) => {
    axiosInstance
      .delete(`/registration/${registrationId}/`)
      .then(() => {
        // re-fetch
        axios
          .get(`${globalUrl.url}/api/registration/?date=${currentDay.date}`)
          .then((res) => {
            setRegistrationMembers(res.data);
            notifySuccess("Removed competitor from registration", "success");
          })
          .catch((err) => {
            console.error("Error fetching regs:", err);
            notifyError("Failed to delete competitor from registration", "error");
          });

        // also restore competitor to left side
        const deleted = registrationMembers.find((c) => c.id === registrationId);
        if (deleted) {
          const compId = deleted.competitor.id;
          setCompetitorTable((prev) => [
            ...prev,
            originalCompetitorTable.find((c) => c.id === compId),
          ]);
        }
      })
      .catch((error) => {
        console.error("Error deleting competitor:", error);
        notifyError("შეცდომა სპორტსმენის წაშლისას", "error");
      });
  };

  // ---------------------------
  // Randomize
  // ---------------------------
  const handleRandomize = () => {
    if (!currentDay) {
      notifyError("გთხოვთ აირჩიოთ შეჯიბრის დღე", "error");
      return;
    }

    axiosInstance
      .post("/randomizer/", {
        start_number: startNumber,
        ignore_numbers: ignoreNumbers,
        competition_day_id: currentDay.id, // or whichever field
        gender: parseInt(selectedGender),
      })
      .then(() => {
        notifySuccess("კენჭისყრა დასრულდა წარმატებით", "success");
        axios
          .get(`${globalUrl.url}/api/registration/?date=${currentDay.date}`)
          .then((res) => setRegistrationMembers(res.data))
          .catch((err) => console.error("Error fetching regs:", err));
      })
      .catch((error) => {
        console.error("Error randomizing:", error);
        notifyError("დაფიქსირდა შეცდომა კენჭისყრისას", "error");
      });
  };

  // ---------------------------
  // Sync results
  // ---------------------------
  const handleSyncResults = () => {
    const registrationIds = registrationMembers.map((r) => r.id);
    axiosInstance
      .post("/batch_sync_results/", { registration_ids: registrationIds })
      .then(() => {
        notifySuccess("მონაცემები დასინქრონდა", "success");
      })
      .catch((err) => console.error("Error syncing results:", err));
  };

  // (Optional) Drag handlers
  const handleDragStart = (event, competitorId) => {
    event.dataTransfer.setData("competitorId", competitorId);
  };
  const handleDragOver = (event) => {
    event.preventDefault();
  };
  const handleDrop = (event) => {
    event.preventDefault();
    // etc.
  };

  // For table column widths
  const columnStyles = { width: "250px" };

  return (
    <Container className="mb-3 lubric">
      <Row>
        {/* COMPETITION DAY NAVIGATOR */}
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
              <Row>
                <Col>
                  <Button
                    variant="success"
                    onClick={handleDownloadExcel}
                  >
                    <FontAwesomeIcon icon={faFileExcel} className="me-1" />Download xlsx
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDownloadPDF}
                    className="ms-3">
                    <FontAwesomeIcon icon={faFilePdf} className="me-1" />
                    Download PDF
                  </Button>
                </Col>
                <Col>

                </Col>
              </Row>

            </Col>

          </Row>




        </Row>
      <Row className="down-lubric">

        <Row>
          <Col className="lubric3">
            {/* Filters */}
            <Row className="mt-4">
              <h5>გაფილტრე</h5>
              <Col>

                <Form.Select
                  as="select"
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                >
                  <option value="" disabled>
                    სქესი
                  </option>
                  <option value="კაცი">კაცი</option>
                  <option value="ქალი">ქალი</option>
                </Form.Select>
              </Col>
              <Col>
                <Form.Control
                  type="number"
                  placeholder="წელი დან"
                  value={filterYearStart}
                  onChange={(e) => setFilterYearStart(e.target.value)}
                />
              </Col>
              <Col>
                <Form.Control
                  type="number"
                  placeholder="წელი მდე"
                  value={filterYearEnd}
                  onChange={(e) => setFilterYearEnd(e.target.value)}
                />
              </Col>

            </Row>
            <Col className="mt-3">
              <Form.Control
                type="text"
                placeholder="სახელი ან გვარი"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </Col>
          </Col>
          <Col className="lubric4">
            <Row>
              <Row className="mt-4">
                <Col>
                  <Form.Group>
                    <Form.Label>საწ.რიცხვი</Form.Label>
                    <Form.Control
                      type="number"
                      value={startNumber}
                      onChange={(e) => setStartNumber(Number(e.target.value))}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Label>გამონაკლისი რიცხვები</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="მაგალითად (3,28,11)"
                      onChange={(e) =>
                        setIgnoreNumbers(e.target.value.split(",").map(Number))
                      }
                    />
                  </Form.Group>
                </Col>
                
              </Row>

              <Row className="mt-4 mb-2">
                
              <Col>
                <Button onClick={handleRandomize}>
                  <FontAwesomeIcon icon={faDice} className="me-2" />
                  კენჭისყრა
                </Button>
                <Button className="ms-3" variant="warning" onClick={handleSyncResults}>
                  <FontAwesomeIcon icon={faRotate} className="me-2" />
                  სინქრონიზაცია
                </Button>
              </Col>



              </Row>

              <Row>
                

              </Row>






            </Row>
          </Col>
        </Row>

        <Row>


        {/* LEFT SIDE: Competitor Table */}
        <Col className="table-container lubric3">
          <div className="mb-4 mt-2">
            <h4>სპორტსმენები</h4>
          </div>



          <Table hover>
            <thead>
              <tr>
                <th style={columnStyles}>სახელი გვარი</th>
                <th>სქესი</th>
                <th>წელი</th>
                <th>სკოლა</th>
                <th>+</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompetitors.map((competitor) => (
                <tr
                  key={competitor.id}
                  draggable
                  onDragStart={(event) => handleDragStart(event, competitor.id)}
                >
                  <td>
                    {competitor.first_name} {competitor.last_name}
                  </td>
                  <td>{competitor.gender}</td>
                  <td>{competitor.year_of_birth}</td>
                  <td>{competitor.school}</td>
                  <td>
                    <Button
                      variant="primary"
                      onClick={() => handleAddCompetitor(competitor)}
                    >
                      <FontAwesomeIcon icon={faArrowRight} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>

        {/* RIGHT SIDE: registration Table(s) */}
        <Col
          className="table-container lubric3"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
              <div>
                <h4>კალათა</h4>
              </div>


          {/* Render the AgeGroup-based tables */}
          <>{renderAgeGroupTables()}</>
        </Col>
        </Row>
        </Row>
      </Row>
    </Container>
  );
};

export default Cart;
