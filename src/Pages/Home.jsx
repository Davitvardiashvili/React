import axios from "axios";
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";

import { globalUrl } from "../App";
import CompetitionDayChooser from "../AdminPages/CompetitionDayChooser";

function Home() {
  // Check if mobile for the responsive columns
  const isMobile = useMediaQuery({ maxWidth: 767 });

  // 1) We'll store the "real" competitionDays AND a special "Season Winners" pseudo-day in extendedDays
  const [competitionDays, setCompetitionDays] = useState([]);
  const [extendedDays, setExtendedDays] = useState([]); 
  const [currentDayIndex, setCurrentDayIndex] = useState(-1);

  // 2) For day-based results
  const [results, setResults] = useState([]);
  // For storing the "season winners" data
  const [seasonWinners, setSeasonWinners] = useState(null);
  // We'll keep your grouped map => array of { ageGroup, items: [] } for day-based results
  const [groupMap, setGroupMap] = useState([]);

  /**************************************************************************
   * 1) Fetch all competition days once, build extendedDays
   **************************************************************************/
  useEffect(() => {
    axios
      .get(`${globalUrl.url}/api/competition-day/`)
      .then((response) => {
        const days = [...response.data];
        // Sort ascending
        days.sort((a, b) => (a.date < b.date ? -1 : 1));
        setCompetitionDays(days);

        // We'll create an array that inserts a "Season Winners" pseudo-day after the last day of each season
        const newDays = [];
        for (let i = 0; i < days.length; i++) {
          newDays.push(days[i]);
          const currentSeason = days[i].stage.season.season;
          const nextSeason =
            i + 1 < days.length
              ? days[i + 1].stage.season.season
              : null;
          // If there's no nextSeason or nextSeason !== currentSeason => we add a pseudo day
          if (!nextSeason || nextSeason !== currentSeason) {
            newDays.push({
              id: `Winners-${currentSeason}`,
              date: `Season Winners: ${currentSeason}`,
              seasonName: currentSeason,
              isSeasonWinners: true
            });
          }
        }

        setExtendedDays(newDays);

        // ---  Default selection with localStorage logic ---
        if (newDays.length > 0) {
          // 1) Check if we have a stored index
          const storedIndex = localStorage.getItem("homeCurrentDayIndex");
          if (storedIndex !== null) {
            const parsedIndex = parseInt(storedIndex, 10);
            if (parsedIndex >= 0 && parsedIndex < newDays.length) {
              // valid index
              setCurrentDayIndex(parsedIndex);
            } else {
              // fallback
              if (newDays.length > 1) {
                setCurrentDayIndex(newDays.length - 2);
              } else {
                setCurrentDayIndex(newDays.length - 1);
              }
            }
          } else {
            // No stored index => default to second-to-last if possible
            if (newDays.length > 1) {
              setCurrentDayIndex(newDays.length - 2);
            } else {
              setCurrentDayIndex(newDays.length - 1);
            }
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching competition days:", error);
      });
  }, []);

  /**************************************************************************
   * 2) Whenever currentDayIndex changes, store it in localStorage
   **************************************************************************/
  useEffect(() => {
    if (currentDayIndex >= 0) {
      localStorage.setItem("homeCurrentDayIndex", currentDayIndex.toString());
    }
  }, [currentDayIndex]);

  /**************************************************************************
   * 3) Determine "currentDay" from extendedDays
   **************************************************************************/
  const currentDay =
    currentDayIndex >= 0 && currentDayIndex < extendedDays.length
      ? extendedDays[currentDayIndex]
      : null;

  /**************************************************************************
   * 4) If we pick a real day => fetch normal results. If we pick winners => fetch /season-winners
   **************************************************************************/
  useEffect(() => {
    if (!currentDay) return;

    if (currentDay.isSeasonWinners) {
      // This is a pseudo day for winners
      setResults([]); // clear normal day results
      setGroupMap([]);
      const seasonName = currentDay.seasonName;
      axios
        .get(`${globalUrl.url}/api/season-winners/?season=${seasonName}`)
        .then((resp) => {
          setSeasonWinners(resp.data);
        })
        .catch((err) => {
          console.error("Error fetching season winners:", err);
        });
    } else {
      // normal day => GET /api/results?date=...
      setSeasonWinners(null);
      axios
        .get(`${globalUrl.url}/api/results?date=${currentDay.date}`)
        .then((res) => {
          setResults(res.data);
        })
        .catch((err) => {
          console.error("Error fetching results:", err);
        });
    }
  }, [currentDay]);

  /**************************************************************************
   * 5) Group & sort day-based results by AgeGroup => female first => youngest->oldest => male
   **************************************************************************/
  useEffect(() => {
    if (!results || results.length === 0) {
      setGroupMap([]);
      return;
    }

    function getGroupKey(ageGroup) {
      if (!ageGroup) return "Unknown Group";
      let label = ageGroup.gender === "ქალი" ? "ქალი" : "კაცი";
      const start = ageGroup.birth_year_start;
      const end = ageGroup.birth_year_end;

      if (start == null && end == null) {
        label += " None";
      } else if (start == null && end !== null) {
        label += ` ↓-${end}`;
      } else if (start !== null && end == null) {
        label += ` ${start}+`;
      } else {
        label += ` ${start}-${end}`;
      }
      return label;
    }

    function ageGroupSortFunc(a, b) {
      // 0 => ქალი, 1 => კაცი
      const genderA = a.ageGroup.gender === "ქალი" ? 0 : 1;
      const genderB = b.ageGroup.gender === "ქალი" ? 0 : 1;
      if (genderA !== genderB) {
        return genderA - genderB;
      }
      const startA = a.ageGroup.birth_year_start || 0;
      const startB = b.ageGroup.birth_year_start || 0;
      return startB - startA; // desc
    }

    function sortByPlace(items) {
      return [...items].sort((r1, r2) => {
        const pa = r1.place ?? 999999;
        const pb = r2.place ?? 999999;
        return pa - pb;
      });
    }

    // Build a map => groupLabel => { ageGroup, items: [] }
    const tempMap = {};
    for (const r of results) {
      const ag = r.registration.age_group;
      const key = getGroupKey(ag);
      if (!tempMap[key]) {
        tempMap[key] = { ageGroup: ag, items: [] };
      }
      tempMap[key].items.push(r);
    }

    // Convert to array
    let arr = Object.keys(tempMap).map((k) => ({
      groupLabel: k,
      ageGroup: tempMap[k].ageGroup,
      items: tempMap[k].items
    }));

    // Sort the groups
    arr.sort(ageGroupSortFunc);

    // Sort items in each group by place
    arr.forEach((grp) => {
      grp.items = sortByPlace(grp.items);
    });

    setGroupMap(arr);
  }, [results]);

  /**************************************************************************
   * 6) Build a user-friendly name for the current day
   **************************************************************************/
  let competitionName = "";
  if (currentDay && !currentDay.isSeasonWinners) {
    const { date, discipline, stage } = currentDay;
    const dateObj = new Date(date);
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = dateObj.toLocaleDateString("en-US", options);

    if (discipline && stage) {
      competitionName = `${formattedDate} — ${stage.name} (${stage.location}) — ${discipline.name}`;
    } else {
      competitionName = formattedDate;
    }
  } else if (currentDay && currentDay.isSeasonWinners) {
    competitionName = `Season Winners for ${currentDay.seasonName}`;
  }

  return (
    <Container className="homePage lubric">
      {/* 1) CompetitionDay chooser */}
      <Row className="mb-3 competition-info-panel">
        <CompetitionDayChooser
          competitionDays={extendedDays}
          currentDayIndex={currentDayIndex}
          setCurrentDayIndex={setCurrentDayIndex}
        />
        <Row className="down-lubric mt-4">
          <Col>
            <div style={{ color: "white" }}>{competitionName}</div>
          </Col>
        </Row>
      </Row>



      <Row className="down-lubric">
        {currentDay?.isSeasonWinners ? (
          <SeasonWinnersView winnersData={seasonWinners} />
        ) : (
          <DayResultsView isMobile={isMobile} groupMap={groupMap} />
        )}
      </Row>
    </Container>
  );
}

/** A sub-component to display normal day-based results (groupMap). */
function DayResultsView({ isMobile, groupMap }) {
  if (!groupMap || groupMap.length === 0) {
    return <div style={{ color: "white" }}>No results for this day</div>;
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      {groupMap.map((gObj) => {
        const groupLabel = gObj.groupLabel;
        return (
          <div key={groupLabel} className="mb-4">
            <h4 style={{ color: "black" }}>{groupLabel}</h4>
            <Table hover>
              <thead>
                {isMobile ? (
                  <tr>
                    <th>Place</th>
                    <th>BIB</th>
                    <th>სპორტსმენი</th>
                    <th>Time</th>
                    <th>Pts</th>
                  </tr>
                ) : (
                  <tr>
                    <th>Place</th>
                    <th>BIB</th>
                    <th>სპორტსმენი</th>
                    <th>დაბ.წელი</th>
                    <th>სკოლა</th>
                    <th>დრო1</th>
                    <th>დრო2</th>
                    <th>ჯამური დრო</th>
                    <th>ქულა</th>
                    <th>სეზონის ქულა</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {gObj.items.map((res) => {
                  const reg = res.registration;
                  const competitor = reg.competitor;
                  return (
                    <tr key={res.id}>
                      {isMobile ? (
                        <>
                          <td className="align-middle place">{res.place}</td>
                          <td className="bib">{reg.bib_number}</td>
                          <td>
                            {competitor.first_name} {competitor.last_name}
                          </td>
                          <td className="totaltime">{res.total_time}</td>
                          <td>{res.points}</td>
                        </>
                      ) : (
                        <>
                          <td className="align-middle place">{res.place}</td>
                          <td className="bib">{reg.bib_number}</td>
                          <td>
                            {competitor.first_name} {competitor.last_name}
                          </td>
                          <td>{competitor.year_of_birth}</td>
                          <td>{competitor.school}</td>
                          <td>{res.run1_time}</td>
                          <td>{res.run2_time}</td>
                          <td className="totaltime">{res.total_time}</td>
                          <td>{res.points}</td>
                          <td>{res.season_points}</td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        );
      })}
    </div>
  );
}

/** A sub-component to display the season winners from /api/season-winners/ */
function SeasonWinnersView({ winnersData }) {
  if (!winnersData) {
    return <div style={{ color: "white" }}>Loading season winners...</div>;
  }
  if (!winnersData.age_groups || winnersData.age_groups.length === 0) {
    return <div style={{ color: "white" }}>No winners data found</div>;
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      {winnersData.age_groups.map((ag, idx) => {
        // e.g. "ქალი 2009-2010" or "ქალი None-2007"
        let rangeStr = "";
        if (ag.birth_year_start === null && ag.birth_year_end === null) {
          rangeStr = "None";
        } else if (ag.birth_year_start === null) {
          rangeStr = `↓ - ${ag.birth_year_end}`;
        } else if (ag.birth_year_end === null) {
          rangeStr = `${ag.birth_year_start}+`;
        } else {
          rangeStr = `${ag.birth_year_start}-${ag.birth_year_end}`;
        }

        return (
          <div key={idx} className="mb-4">
            <h4 style={{ color: "black" }}>
              {ag.gender} {rangeStr}
            </h4>
            <Table hover>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Competitor</th>
                  
                  <th>Season Points</th>
                  <th>Sum Places (Tie-break)</th>
                </tr>
              </thead>
              <tbody>
                {ag.winners.map((w) => (
                  <tr key={w.competitor_id}>
                    <td className="place">{w.ranking}</td>
                    <td>
                      {w.first_name} {w.last_name}
                    </td>
                    <td className="totaltime">{w.season_points}</td>
                    <td>{w.sum_places}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        );
      })}
    </div>
  );
}

export default Home;
