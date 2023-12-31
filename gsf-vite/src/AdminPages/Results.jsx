import axios from "axios";
import React, { useEffect, useState } from "react";
import axiosInstance from '../axiosInstance/axiosInstance';
import { notifyError, notifySuccess } from '../App';
import { Button, Table, Form,Container, FormGroup, FormControl, Row, Col } from 'react-bootstrap';
import { globalUrl } from "../App";
const Results = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [filterOptions, setFilterOptions] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [groupedResults, setGroupedResults] = useState({});
  const [editedRuns, setEditedRuns] = useState({});
  const [sortedResults, setSortedResults] = useState({});
  const [sortMethod, setSortMethod] = useState('bib');
  const columnStyles = {
    width: '250px', // You can adjust the width as needed
  };
  const paddingCol = {
    paddingLeft:'2rem',
    
  }
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
      groups[groupName].sort((a, b) => a.cart_detail.bib_number - b.cart_detail.bib_number);
    }
  
    return groups;
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    applyFilter(filter);
  };



  const handleRunChange = (id, field, value) => {
    setEditedRuns((prevRuns) => ({
      ...prevRuns,
      [id]: {
        ...prevRuns[id],
        [field]: value,
      },
    }));
  };

  useEffect(() => {
    axios
      .get(`${globalUrl.url}/api/results/`)
      .then((response) => {
        setResults(response.data);
        extractFilterOptions(response.data);
        setFilteredResults(response.data); // Initialize filtered results
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [axiosInstance]);


  useEffect(() => {
    // Sort results by BIB number initially
    const sortedData = sortResultsByBIB(filteredResults);
    setSortedResults(organizeDataByGroups(sortedData));
  }, [filteredResults]);


  const sortResultsByBIB = (data) => {
    return [...data].sort((a, b) => a.cart_detail.bib_number - b.cart_detail.bib_number);
  };

  const sortResults = (data, method) => {
    if (method === 'place') {
      return [...data].sort((a, b) => a.cart_detail.place - b.cart_detail.place);
    }else{
      // Default to sorting by BIB number
      return [...data].sort((a, b) => a.cart_detail.bib_number - b.cart_detail.bib_number);
    }

  };

  const extractFilterOptions = (data) => {
    const filterSet = new Set();
  
    data.forEach((item) => {
      const seasonName = item.cart_detail.group.competition.stage.season.season;
      const stageName = item.cart_detail.group.competition.stage.name;
      const disciplineName = item.cart_detail.group.competition.discipline.discipline;
  
      const filterOption = `${seasonName} - ${stageName} - ${disciplineName}`;
      filterSet.add(filterOption);
  
      setEditedRuns((prevRuns) => ({
        ...prevRuns,
        [item.id]: {
          run1: item.run1 || "",
          run2: item.run2 || ""
        },
      }));
    });
  
    setFilterOptions(Array.from(filterSet));
  };


  const handleUpdate = async (id) => {
    try {
      const { run1, run2 } = editedRuns[id] || {};
      // Send a PUT request to update the record
      axiosInstance.put(`/results/${id}/`, { run1, run2}).then(far => {
        axios.get(`${globalUrl.url}/api/results/`).then(response => {
          console.log(response.data);
          setResults(response.data);
          applyFilter(selectedFilter);
          notifySuccess("შედეგი წარმატებით დაემატა", "success");
        })
        // Update the state and trigger re-render
      })
    } catch (error) {
      console.error("Error updating record:", error);
      notifyError("დაფიქსირდა შეცდომა შედეგის დამატებისას", "error");
    }
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

  return (
    <Container className="resultsTable">
      <Row>
        <Col>
          <Form.Control as="select" value={selectedFilter} onChange={(e) => handleFilterChange(e.target.value)}>
            <option value="">Select Season - Stage - Discipline</option>
            {filterOptions.map((filter) => (
              <option key={filter} value={filter}>
                {filter}
              </option>
            ))}
          </Form.Control>

          {sortedResults && Object.keys(sortedResults).map((groupName) => (
            <div key={groupName} className="rudika">
              <h4 className="mt-4 group-name">{groupName}</h4>
              <hr className="mt-2"></hr>
              <Table striped hover>
                <thead className="padded" >
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
                  {sortedResults[groupName]?.map((result) => (
                    <tr key={result.id}>
                      <td style={{paddingLeft:'3rem'}} className="align-middle place">{result.place}</td>
                      <td className="align-middle bib">{result.cart_detail.bib_number}</td>
                      <td className="align-middle atlet">{result.cart_detail.competitor.name} {result.cart_detail.competitor.surname}</td>
                      <td className="align-middle">{result.cart_detail.competitor.year}</td>
                      <td className="align-middle">{result.cart_detail.competitor.school}</td>
                      <td className="align-middle">
                        <Form.Control
                          type="text"
                          value={editedRuns[result.id]?.run1 || ""}
                          onChange={(e) => handleRunChange(result.id, "run1", e.target.value)}
                          placeholder="00:00,00"
                        />
                      </td>
                      <td className="align-middle">
                        <Form.Control
                          type="text"
                          value={editedRuns[result.id]?.run2 || ""}
                          onChange={(e) => handleRunChange(result.id, "run2", e.target.value)}
                          placeholder="00:00,00"
                        />
                      </td>

                      <td className="align-middle">
                        <Button variant="warning" onClick={() => handleUpdate(result.id)}>
                          შენახვა
                        </Button>
                      </td>
                      <td className="align-middle totaltime">{result.run_total}</td>
                      <td className="align-middle">{result.point}</td>
                      <td className="align-middle">{result.season_point}</td>

                    </tr>
                  ))}
                </tbody>
              </Table>
              
            </div>
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default Results;
