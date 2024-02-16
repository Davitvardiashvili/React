import axios from "axios";
import React, { useEffect, useState } from "react";
import "./css/home.css";
import { Button, Table, Form, Container, FormGroup, FormControl, Row, Col } from 'react-bootstrap';
import { globalUrl } from "../App";
import ChampionshipCup from './ChampionshipCup'; // Adjust the path based on your project structure

const Home = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [filterOptions, setFilterOptions] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [groupedResults, setGroupedResults] = useState({});
  const [sortedResults, setSortedResults] = useState({});

  const applyFilter = (selectedFilter) => {
    const [selectedSeason, selectedStage, selectedDiscipline] = selectedFilter.split(' - ');

    const filtered = results.filter((result) => {
      const matchesSeason = selectedSeason
        ? result.cart_detail.group.competition.stage.season.season === selectedSeason
        : true;
      const matchesStage = selectedStage
        ? result.cart_detail.group.competition.stage.name === selectedStage
        : true;
      const matchesDiscipline = selectedDiscipline
        ? result.cart_detail.group.competition.discipline.discipline === selectedDiscipline
        : true;
      return matchesSeason && matchesStage && matchesDiscipline;
    });

    setFilteredResults(filtered);
    setGroupedResults(organizeDataByGroups(filtered));
  };

  const organizeDataByGroups = (data) => {
    const groups = {};

    data.forEach((result) => {
      const groupName = result.cart_detail.group.group_name;
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(result);
    });

    // Sort each group's competitors by BIB number
    for (const groupName in groups) {
      groups[groupName].sort((a, b) => a.cart_detail.place - b.cart_detail.place);
    }

    return groups;
  };

  useEffect(() => {
    axios
      .get(`${globalUrl.url}/api/results/`)
      .then((response) => {
        const sortedData = sortByPlace(response.data);
        setResults(sortedData);
        extractFilterOptions(sortedData);
        setFilteredResults(sortedData); // Initialize filtered results
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const extractFilterOptions = (data) => {
    const filterSet = new Set();

    data.forEach((item) => {
      const seasonName = item.cart_detail.group.competition.stage.season.season;
      const stageName = item.cart_detail.group.competition.stage.name;
      const disciplineName = item.cart_detail.group.competition.discipline.discipline;

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
          <Form.Control as="select" value={selectedFilter} onChange={(e) => handleFilterChange(e.target.value)}>
            <option value="" disabled>აირჩიე შეჯიბრი</option>
            {filterOptions.map((filter) => (
              <option key={filter} value={filter}>
                {filter}
              </option>
            ))}
          </Form.Control>

          {sortedResults && Object.keys(sortedResults).map((groupName) => (
            <div key={groupName} className="rudika">
              <div className="groupform"><h4 className="mt-4 group-name">{groupName}</h4></div>

              <hr className="mt-2"></hr>
              <Table striped hover>
                <thead className="padded">
                  <tr>
                    <th style={{ paddingLeft: '2rem', width: "50px" }}>Rank</th>
                    <th>Bib</th>
                    <th style={columnStyles}>სპორტსმენი</th>
                    <th>დაბ.წელი</th>
                    <th>სკოლა</th>
                    <th>დრო 1</th>
                    <th>დრო 2</th>
                    <th>ჯამური დრო</th>
                    <th>სხვაობა</th>
                    <th>ქულა</th>
                    <th>სეზონის ქულა</th>
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
                        <td style={{ paddingLeft: '3rem' }} className="align-end place">
                          {index < 3 && (
                            <>
                              {[1, 2, 3].map((cupRank) => (
                                <React.Fragment key={cupRank}>
                                  {result.place === cupRank && (
                                    <>
                                      <ChampionshipCup rank={result.place} />
                                      <span></span>
                                    </>
                                  )}
                                </React.Fragment>
                              ))}
                            </>
                          )}
                          {index >= 3 ? result.place : null}
                        </td>
                        <td className="align-middle bib">{result.cart_detail.bib_number}</td>
                        <td className="align-middle atlet">{result.cart_detail.competitor.name} {result.cart_detail.competitor.surname}</td>
                        <td>{result.cart_detail.competitor.year}</td>
                        <td>{result.cart_detail.competitor.school}</td>
                        <td className="align-middle place">{result.run1}</td>
                        <td className="align-middle place">{result.run2}</td>
                        <td className="align-middle totaltime">{result.run_total}</td>
                        <td className="align-middle place">{index === 0 ? '' : timeDiff}</td>
                        <td>{result.point}</td>
                        <td>{result.season_point}</td>
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
