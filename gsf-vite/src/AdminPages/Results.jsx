import axios from "axios";
import React, { useEffect, useState } from "react";
import axiosInstance from '../axiosInstance/axiosInstance';
import { notifyError, notifySuccess } from '../App';
import { Button, Table, Form,Container, FormGroup, FormControl, Row, Col } from 'react-bootstrap';

const Results = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [filterOptions, setFilterOptions] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [groupedResults, setGroupedResults] = useState({});
  const [editedRuns, setEditedRuns] = useState({});
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

    return groups;
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    applyFilter(filter);
  };

  const handleStatusChange = (id, newStatusId) => {
    setEditedRuns((prevRuns) => ({
      ...prevRuns,
      [id]: {
        ...prevRuns[id],
        status_id: parseInt(newStatusId),
      },
    }));
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
      .get("http://localhost:8000/api/results/")
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

  const extractFilterOptions = (data) => {
    const filterSet = new Set();
  
    data.forEach((item) => {
      const seasonName = item.cart_detail.group.competition.stage.season.season;
      const stageName = item.cart_detail.group.competition.stage.name;
      const disciplineName = item.cart_detail.group.competition.discipline.discipline;
  
      const filterOption = `${seasonName} - ${stageName} - ${disciplineName}`;
      filterSet.add(filterOption);
  
      // Initialize editedRuns with actual run1, run2 values, and the current statusId
      setEditedRuns((prevRuns) => ({
        ...prevRuns,
        [item.id]: {
          run1: item.run1 || "",
          run2: item.run2 || "",
          status_id: item.status_id || "1", // Initialize statusId
        },
      }));
    });
  
    setFilterOptions(Array.from(filterSet));
  };


  const handleUpdate = async (id) => {
    try {
      const { run1, run2, status_id } = editedRuns[id] || {};
      // Send a PUT request to update the record
      axiosInstance.put(`/results/${id}/`, { run1, run2, status_id}).then(far => {
        axios.get("http://localhost:8000/api/results/").then(response => {
          console.log(response.data);
          setResults(response.data);
          applyFilter(selectedFilter);
          notifySuccess("Result Updated", "success");
        })
        // Update the state and trigger re-render
      })
    } catch (error) {
      console.error("Error updating record:", error);
      notifyError("Failed to update Result", "error");
    }
  };

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

          {Object.keys(sortedResults).map((groupName) => (
            <div key={groupName}>
              <h4 className="mt-4">{groupName}</h4>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>სახელი გვარი</th>
                    <th>BIB</th>
                    <th>სქესი</th>
                    <th>დაბ.წელი</th>
                    <th>სკოლა</th>
                    <th>დრო 1</th>
                    <th>დრო 2</th>
                    <th>ჯამური დრო</th>
                    <th>სტატუსი</th>
                    <th>ქულა</th>
                    <th>სეზონის ქულა</th>
                    <th>მოქმედება</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults[groupName]?.map((result) => (
                    <tr key={result.id}>
                      <td className="align-middle">{result.place}</td>
                      <td className="align-middle">{result.competitor.name} {result.competitor.surname}</td>
                      <td className="align-middle">{result.cart_detail.bib_number}</td>
                      <td className="align-middle">{result.competitor.gender}</td>
                      <td className="align-middle">{result.competitor.year}</td>
                      <td className="align-middle">{result.competitor.school}</td>
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
                      <td className="align-middle">{result.run_total}</td>
                      <td className="align-middle">
                        <Form.Control as="select"
                          value={editedRuns[result.id]?.status_id || result.status_id}
                          onChange={(e) => handleStatusChange(result.id, e.target.value)}
                        >
                          <option value="1">Active</option>
                          <option value="2">DNF</option>
                          <option value="3">DNS</option>
                        </Form.Control>
                      </td>
                      <td className="align-middle">{result.point}</td>
                      <td className="align-middle">{result.season_point}</td>
                      <td className="align-middle">
                        <Button variant="primary" onClick={() => handleUpdate(result.id)}>
                          შენახვა
                        </Button>
                      </td>
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
