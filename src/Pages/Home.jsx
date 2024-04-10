import axios from "axios";
import React, { useEffect, useState } from "react";
import "./css/home.css";
import { Button, Table, Form, Container, FormGroup, FormControl, Row, Col } from 'react-bootstrap';
import { globalUrl } from "../App";
import ChampionshipCup from './ChampionshipCup'; // Adjust the path based on your project structure
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';
import { useMediaQuery } from 'react-responsive';




const Home = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [filterOptions, setFilterOptions] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [groupedResults, setGroupedResults] = useState({});
  const [sortedResults, setSortedResults] = useState({});


  const [competitions, setCompetitions] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [competitionName, setCompetitionName] = useState('');


  useEffect(() => {
    // Fetch competitions
    axios.get(`${globalUrl.url}/api/competition`)
      .then(response => {
        setCompetitions(response.data);
      })
      .catch(error => {
        console.error("Error fetching competitions:", error);
      });
  }, []);


  useEffect(() => {
    if (competitions.length > 0) {
      // Extract sets of seasons, stages, and disciplines from competitions data
      const seasonsSet = new Set(competitions.map(competition => competition.stage.season.season));
      const stagesSet = new Set(competitions.map(competition => competition.stage.name));
      const disciplinesSet = new Set(competitions.map(competition => competition.discipline.discipline));

      // Get the last element from each set
      const lastSeason = [...seasonsSet].pop();
      const lastStage = [...stagesSet].pop();
      const lastDiscipline = [...disciplinesSet].pop();

      // Set the last season, stage, and discipline as the default selected values
      setSelectedSeason(lastSeason);
      setSelectedStage(lastStage);
      setSelectedDiscipline(lastDiscipline);
      setCompetitionName("სეზონი - " + lastSeason + " - " + lastStage + " - " + lastDiscipline)


      axios.get(`${globalUrl.url}/api/search-results/?season=${lastSeason}&stage=${lastStage}&discipline=${lastDiscipline}`)
      .then(response => {
        setFilteredResults(response.data);
      })
      .catch(error => {
        console.error("Error searching results:", error);
      });

    }
  }, [competitions]);

  const seasons = [...new Set(competitions.map(competition => competition.stage.season.season))];
  const stages = selectedSeason ? [...new Set(competitions.filter(competition => competition.stage.season.season === selectedSeason).map(competition => competition.stage.name))] : [];
  const disciplines = selectedStage ? [...new Set(competitions.filter(competition => competition.stage.name === selectedStage && competition.stage.season.season === selectedSeason).map(competition => competition.discipline.discipline))] : [];

  const handleSeasonChange = (event) => {
    setSelectedSeason(event.target.value);
    setSelectedStage('');
    setSelectedDiscipline('');
  };

  const handleStageChange = (event) => {
    setSelectedStage(event.target.value);
    setSelectedDiscipline('');
  };

  const handleDisciplineChange = (event) => {
    setSelectedDiscipline(event.target.value);
    if (selectedSeason && selectedStage && event.target.value) {
      // Trigger search request when all parameters are selected
      setCompetitionName("სეზონი - " + selectedSeason + " - " + selectedStage + " - " + event.target.value)

      axios.get(`${globalUrl.url}/api/search-results/?season=${selectedSeason}&stage=${selectedStage}&discipline=${event.target.value}`)
        .then(response => {
          setFilteredResults(response.data);
        })
        .catch(error => {
          console.error("Error searching results:", error);
        });
    }
  };



  const organizeDataByGroups = (data) => {
    const groups = {};

    data.forEach((result) => {
      const groupName = result.group_name;
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(result);
    });

    // Sort each group's competitors by BIB number
    for (const groupName in groups) {
      groups[groupName].sort((a, b) => a.place - b.place);
    }

    return groups;
  };


  const extractFilterOptions = (data) => {
    const filterSet = new Set();

    data.forEach((item) => {
      const seasonName = item.season_name;
      const stageName = item.stage_name;
      const disciplineName = item.discipline_name;

      const filterOption = `${seasonName} - ${stageName} - ${disciplineName}`;
      filterSet.add(filterOption);
    });

    setFilterOptions(Array.from(filterSet));
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    applyFilter(filter);
  };

  const sortByPlace = (data) => {
    return [...data].sort((a, b) => a.place - b.place);
  };

  const columnStyles = {
    width: '350px', // You can adjust the width as needed
  };

  const extractGroupInfo = (groupName) => {
    const gender = groupName.includes("გოგოები") ? 'ქალი' : 'კაცი';
    const yearMatch = groupName.match(/\d{4}/g);
    const year = yearMatch ? parseInt(yearMatch[0], 10) : 0; // Default to 0 if no year is found
    return { gender, year };
  };

  const sortGroups = (groupNames) => {
    return groupNames.sort((a, b) => {
      const groupA = extractGroupInfo(a);
      const groupB = extractGroupInfo(b);

      if (groupA.gender === groupB.gender) {
        return groupB.year - groupA.year; // Sort by year in descending order if same gender
      }
      return groupA.gender === 'ქალი' ? -1 : 1; // Females first
    });
  };

  useEffect(() => {
    // When filteredResults change, update groupedResults and sortedResults
    const groupedData = organizeDataByGroups(filteredResults);
    setGroupedResults(groupedData);

    const sortedGroupNames = sortGroups(Object.keys(groupedData));
    const sortedData = {};
    sortedGroupNames.forEach((groupName) => {
      sortedData[groupName] = groupedData[groupName];
    });
    setSortedResults(sortedData);
  }, [filteredResults]);

  const parseTime = (timeStr) => {
    const [minutes, rest] = timeStr.split(':');
    const [seconds, hundredths] = rest.split(',');
    return parseInt(minutes) * 60 + parseInt(seconds) + parseInt(hundredths) / 100;
  };

  const formatTimeDiff = (timeDiff) => {
    const sign = timeDiff >= 0 ? "+" : "-";
    timeDiff = Math.abs(timeDiff);
    const minutes = Math.floor(timeDiff / 60);
    const seconds = Math.floor(timeDiff % 60);
    const hundredths = Math.round((timeDiff % 1) * 100);
    if (minutes > 0) {
      return `${sign}${minutes.toString().padStart(1, '0')}:${seconds.toString().padStart(1, '0')}.${hundredths.toString().padStart(2, '0')}`;
    } else {
      return `${sign}${seconds.toString().padStart(1, '0')}.${hundredths.toString().padStart(2, '0')}`;
    }
  };
  const [shakeAnimation, setShakeAnimation] = useState(false);

  // Function to start the shake animation
  const startShakeAnimation = () => {
    setShakeAnimation(true);
    setTimeout(() => {
      setShakeAnimation(false);
    }, 1000); // Adjust the duration of the shake animation as needed
  };

  return (
    <Container className="resultsTable ">
      <Row>
        <Col>
        <Row>
          {!isMobile ? (
            <>

            <Col sm={'2'}>
              <Form.Select as="select" value={selectedSeason} onChange={handleSeasonChange}>
                  <option value="" disabled>სეზონი</option>
                  {seasons.map(season => (
                    <option key={season} value={season}>{season}</option>
                  ))}
              </Form.Select>
            </Col>

            <Col sm={"4"}>
              <Form.Select  as="select" value={selectedStage} onChange={handleStageChange}>
                <option value="" disabled>ეტაპი</option>
                {stages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </Form.Select>
            </Col>
            <Col sm={"3"}>

              <Form.Select  as="select" value={selectedDiscipline} onChange={handleDisciplineChange}>
                <option value="" disabled>დისციპლინა</option>
                {disciplines.map(discipline => (
                  <option key={discipline} value={discipline}>{discipline}</option>
                ))}
              </Form.Select>
            </Col>
            
            <Col className="mt-3" sm={12}>
              <div><h6>{competitionName}</h6></div>         
              <hr></hr>
            </Col>

            </>
          ) : (
            <>

            <Row>
            <Form.Select as="select" value={selectedSeason} onChange={handleSeasonChange}>
                <option value="" disabled>სეზონი</option>
                {seasons.map(season => (
                  <option key={season} value={season}>{season}</option>
                ))}
            </Form.Select>
            </Row>

            <Row>
              <Form.Select  as="select" value={selectedStage} onChange={handleStageChange}>
                <option value="" disabled>ეტაპი</option>
                {stages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </Form.Select>
            </Row>
            <Row>

              <Form.Select  as="select" value={selectedDiscipline} onChange={handleDisciplineChange}>
                <option value="" disabled>დისციპლინა</option>
                {disciplines.map(discipline => (
                  <option key={discipline} value={discipline}>{discipline}</option>
                ))}
              </Form.Select>
            </Row>
            <Row className="mt-2" sm={12}>
              <hr></hr>
              <div><h6>{competitionName}</h6></div>
            </Row>
            
            </>
          )}



          </Row>


          {sortedResults && Object.keys(sortedResults).map((groupName) => (
            <div key={groupName} className="rudika">
              <div className="groupform"><h4 className="mt-2 group-name">{groupName}</h4></div>

              <hr className="mt-2"></hr>
              <Table striped hover>
                <thead className="padded">
                  <tr>
                    {!isMobile ? (
                      <>
                        <th style={{ paddingLeft: '2rem', width: "50px" }}>Rank</th>
                        <th>Bib</th>
                        <th style={columnStyles}>Athlete</th>
                        <th>Year</th>
                        <th>School</th>
                        <th>Run 1</th>
                        <th>Run 2</th>
                        <th>Time</th>
                        <th>Diff</th>
                        <th>Points</th>
                        <th>Season Points</th>
                      </>
                    ) : (<>
                        <th  style={{ paddingLeft: '0.2rem' }}>Rank</th>
                        <th>Bib</th>
                        <th>Athlete</th>
                        <th>Year</th>
                        <th>School</th>
                        <th>Time</th>
                        <th>Season Points</th>
                    </>)}
                  </tr>
                </thead>

                <tbody>
                  {sortedResults[groupName]?.map((result, index, array) => {
                    let timeDiff = "";
                    if (result.run_total && index > 0) {
                      let prevIndex = index - 1;
                      // Find the previous competitor with a non-empty run_total
                      while (prevIndex >= 0 && !array[prevIndex].run_total) {
                        prevIndex--;
                      }
                      if (prevIndex >= 0) {
                        const prevTimeInSeconds = parseTime(array[prevIndex].run_total);
                        const currentTimeInSeconds = parseTime(result.run_total);
                        timeDiff = formatTimeDiff(currentTimeInSeconds - prevTimeInSeconds);
                      }
                    }
                    return (
                      <tr key={result.id} style={{ height: "2.8rem" }}>
                        {!isMobile ? (
                          <>
                            <td style={{ paddingLeft: '3rem' }} className="align-end place tilt-shaking">
                            {result.place === 1 && (<FontAwesomeIcon
                                icon={faTrophy}
                                style={{ color: "#FFD43B" }}/>)}
                            {result.place === 2 && (
                              <FontAwesomeIcon
                                icon={faTrophy}
                                style={{ color: "#C0C0C0" }}/>
                            )}
                            {result.place === 3 && (
                              <FontAwesomeIcon
                                icon={faTrophy}
                                style={{ color: "#CD7F32" }}/>
                            )}
                            {(index >= 3) && result.place}
                          </td>
                          <td className="align-middle bib">{result.bib_number}</td>
                          <td className="align-middle atlet">{result.competitor_info.name} {result.competitor_info.surname}</td>
                          <td>{result.competitor_info.year}</td>
                          <td>{result.competitor_info.school}</td>
                          <td className="align-middle place">{result.run1}</td>
                          <td className="align-middle place">{result.run2}</td>
                          <td className="align-middle totaltime">{result.run_total}</td>
                          <td className="align-middle place">{index === 0 ? '' : timeDiff}</td>
                          <td>{result.point}</td>
                          <td>{result.season_point}</td>
                        </>
                        ) : (
                          <>
                              <td style={{ paddingLeft: '1rem' }} className="align-end place tilt-shaking">
                              {result.place === 1 && (
                                <FontAwesomeIcon
                                  icon={faTrophy}
                                  style={{ color: "#FFD43B" }}
                                />
                              )}
                              {result.place === 2 && (
                                <FontAwesomeIcon
                                  icon={faTrophy}
                                  style={{ color: "#C0C0C0" }}
                                />
                              )}
                              {result.place === 3 && (
                                <FontAwesomeIcon
                                  icon={faTrophy}
                                  style={{ color: "#CD7F32" }}
                                />
                              )}
                              {/* Display rank for other positions */}
                              {(index >= 3) && result.place}
                            </td>
                            <td className="align-middle bib">{result.bib_number}</td>
                            <td className="align-middle atlet">{result.competitor_info.name} {result.competitor_info.surname}</td>
                            <td>{result.competitor_info.year}</td>
                            <td>{result.competitor_info.school.substring(0, 3)}</td>
                            <td className="align-middle place">{index === 0 ? result.run_total : timeDiff}</td>
                            <td>{result.season_point}</td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
