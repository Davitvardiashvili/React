import axios from "axios";
import React, { useEffect, useState } from "react";
import axiosInstance from '../axiosInstance/axiosInstance';
import { notifyError, notifySuccess } from '../App';
import { Button, Table, Form,Container, FormGroup, FormControl, Row, Col } from 'react-bootstrap';
import { globalUrl } from "../App";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDice,faShirt,faFilePdf,faArrowDown19,faArrowDownUpAcrossLine,faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';

const Results = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [filterOptions, setFilterOptions] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [groupedResults, setGroupedResults] = useState({});
  const [editedRuns, setEditedRuns] = useState({});
  const [sortedResults, setSortedResults] = useState({});
  const [sortMethod, setSortMethod] = useState('bib');
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [sortedResultIds, setSortedResultIds] = useState([]);

  const [competitions, setCompetitions] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [competitionName, setCompetitionName] = useState('');




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

  const columnStyles = {
    width: '250px', // You can adjust the width as needed
  };
  const paddingCol = {
    paddingLeft:'2rem',
  }

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
      groups[groupName].sort((a, b) => a.bib_number - b.bib_number);
    }
  
    return groups;
  };


  // const handleRunChange = (id, field, value) => {
  //   var formattedValue = value;
  
  //   // if (value.length === 2 || value.length === 5) {
  //   //   formattedValue = value + ":";
  //   // } else if (value.length === 8) {
  //   //   formattedValue = value.slice(0, 5) + "," + value.slice(6);
  //   // }
  
  //   // Update the state
  //   setEditedRuns((prevRuns) => ({
  //     ...prevRuns,
  //     [id]: {
  //       ...prevRuns[id],
  //       [field]: formattedValue,
  //     },
  //   }));
  // };



  const handleRunChange = (id, field, value) => {
    // Update the state only if the value is not empty
    if (value !== "") {
      let formattedValue = value;
      // Add formatting logic here if needed
  
      // Update the state
      setEditedRuns((prevRuns) => ({
        ...prevRuns,
        [id]: {
          ...prevRuns[id],
          [field]: formattedValue,
        },
      }));
    } else {
      // If the value is empty, set it to empty string
      setEditedRuns((prevRuns) => ({
        ...prevRuns,
        [id]: {
          ...prevRuns[id],
          [field]: "",
        },
      }));
    }
  };
  
  




  useEffect(() => {
    // Sort results by BIB number initially
    const sortedData = sortResultsByBIB(filteredResults);
    setSortedResults(organizeDataByGroups(sortedData));
  }, [filteredResults]);


  const sortResultsByBIB = (data) => {
    return [...data].sort((a, b) => a.bib_number - b.bib_number);
  };

    const sortByPlace = (data) => {
    return [...data].sort((a, b) => a.place - b.place);
  };



  const handleUpdate = async (id) => {
    try {
      const { run1, run2 } = editedRuns[id] || {};
      // Send a PUT request to update the record
      await axiosInstance.put(`/results/${id}/`, { run1, run2 });
  
      // Fetch the updated result data after the update
      const updatedResultsResponse = await axiosInstance.get(`/search-results/?season=${selectedSeason}&stage=${selectedStage}&discipline=${selectedDiscipline}`);
  
      // Update the filtered results with the edited runs
      const updatedResults = updatedResultsResponse.data;
  
      setFilteredResults(updatedResults);
  
      // After updating the filtered results, you may need to re-sort and re-organize the data if necessary
      // For example:
      const groupedData = organizeDataByGroups(updatedResults);
      const sortedGroupNames = sortGroups(Object.keys(groupedData));
      const sortedData = {};
      const sortedIds = [];
      sortedGroupNames.forEach((groupName) => {
        const sortedGroup = sortResultsByMethod(groupedData[groupName], sortMethod);
        sortedData[groupName] = sortedGroup;
        sortedIds.push(...sortedGroup.map(result => result.id));
      });
      setGroupedResults(groupedData);
      setSortedResults(sortedData);
      setSortedResultIds(sortedIds);
  
      notifySuccess("Results successfully updated", "success");
    } catch (error) {
      console.error("Error updating record:", error);
      notifyError(
        "Error occurred while updating results",
        "error"
      );
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
  
  const handleSortSwitch = () => {
    setSortMethod((prevMethod) => (prevMethod === 'bib' ? 'place' : 'bib'));
    
  };

  const sortResultsByMethod = (data, method) => {
    if (method === 'place') {
      return sortByPlace(data);
    } else {
      // Default to sorting by BIB number
      return sortResultsByBIB(data);
    }
  };

  useEffect(() => {
    // When filteredResults change, update groupedResults and sortedResults
    const groupedData = organizeDataByGroups(filteredResults);
    setGroupedResults(groupedData);

    const sortedGroupNames = sortGroups(Object.keys(groupedData));
    const sortedData = {};
    const sortedIds = [];
    sortedGroupNames.forEach((groupName) => {
      const sortedGroup = sortResultsByMethod(groupedData[groupName], sortMethod);
      sortedData[groupName] = sortedGroup;
      sortedIds.push(...sortedGroup.map(result => result.id));
    });
    setSortedResults(sortedData);
    setSortedResultIds(sortedIds);
  }, [filteredResults, sortMethod]);



  const handleSortGroupByPlace = (groupName) => {
    const groupCompetitors = [...sortedResults[groupName]]; // Create a copy to avoid mutating the state
  
    // Sort competitors by place
    const sortedGroup = sortByPlace(groupCompetitors);
  
    // Reverse the order of the first five competitors
    const reversedFirstFive = sortedGroup.slice(0, 5).reverse();
    const rest = sortedGroup.slice(5);
  
    // Combine the reversed first five and the rest of the competitors
    const sortedGroupByFlip = reversedFirstFive.concat(rest);
  
    // Create a new object for sortedResults
    const newSortedResults = { ...sortedResults, [groupName]: sortedGroupByFlip };
    const sortedIds = Object.values(newSortedResults).flatMap(resultGroup => resultGroup.map(result => result.id));
  
    // Update the state with the sorted data
    setSortedResults(newSortedResults);
    setSortedResultIds(sortedIds);
  };

  const handleSortGroupByPlaceNormally = (groupName) => {
    const groupCompetitors = [...sortedResults[groupName]]; // Create a copy to avoid mutating the state
  
    const sortedGroup = sortByPlace(groupCompetitors);
    const sortedGroupByFlip = sortedGroup;
  
    const newSortedResults = { ...sortedResults, [groupName]: sortedGroupByFlip };
    const sortedIds = Object.values(newSortedResults).flatMap(resultGroup => resultGroup.map(result => result.id));
  
    setSortedResults(newSortedResults);
    setSortedResultIds(sortedIds);
  };

  const handleSortGroupByBib = (groupName) => {
    const groupCompetitors = [...sortedResults[groupName]]; // Create a copy to avoid mutating the state
  
    const sortedGroup = sortResultsByBIB(groupCompetitors);
    const sortedGroupByFlip = sortedGroup;
  
    const newSortedResults = { ...sortedResults, [groupName]: sortedGroupByFlip };
    const sortedIds = Object.values(newSortedResults).flatMap(resultGroup => resultGroup.map(result => result.id));
  
    setSortedResults(newSortedResults);
    setSortedResultIds(sortedIds);
  };
  
  
  

  const handleDownloadPDF = () => {
    if (!selectedSeason && !selectedStage && !selectedDiscipline) {
      notifyError("Please select a competition first", "error");
      return;
    }

    if (sortedResultIds.length > 0) {
      axiosInstance.post('/download_results_pdf/', { resultIds: sortedResultIds }, {
        responseType: 'blob',
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data], {
          type: 'application/pdf'
        }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Results_${selectedStage}-${selectedDiscipline}.pdf`);  // Set the desired filename
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error('Error downloading PDF file:', error);
        notifyError("Failed to download PDF file", "error");
      });
    } else {
      notifyError("No competitors in the selected competition", "error");
    }
  };




  return (
    <Container className="resultsTable">
      <Row>
        <Col>
        <Row>

        <Col sm={'2'}>
          <Form.Select as="select" value={selectedSeason} onChange={handleSeasonChange}>
              <option value="">სეზონი</option>
              {seasons.map(season => (
                <option key={season} value={season}>{season}</option>
              ))}
          </Form.Select>
          </Col>

          <Col sm={"3"}>
            <Form.Select  as="select" value={selectedStage} onChange={handleStageChange}>
              <option value="">ეტაპი</option>
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </Form.Select>
          </Col>
          <Col sm={"3"}>
            <Form.Select  as="select" value={selectedDiscipline} onChange={handleDisciplineChange}>
              <option value="">დისციპლინა</option>
              {disciplines.map(discipline => (
                <option key={discipline} value={discipline}>{discipline}</option>
              ))}
            </Form.Select>
          </Col>
          

        </Row>
        <hr className="mb-1"></hr>
        <Row className="mt-3">
          <Col sm={12}>
            <div><h6>{competitionName}</h6></div>         
            <hr></hr>
          </Col>
          <Col sm={4}>
            <Button   variant={sortMethod === 'bib' ? 'primary' : 'success'} onClick={handleSortSwitch}>
            <FontAwesomeIcon icon={sortMethod === 'bib' ? faArrowDown19 : faShirt } className="me-2" />
              {`Sort by ${sortMethod === 'bib' ? 'Place' : 'BIB'}`}
            </Button>
            <Button variant="danger" className="ms-2" onClick={handleDownloadPDF}>
            <FontAwesomeIcon icon={faFilePdf} className="me-2" />
              PDF - Result List</Button>
          
          </Col>
        </Row>

         
            





          {sortedResults && Object.keys(sortedResults).map((groupName) => (
            <div key={groupName} className="rudika">
              <div className="groupform"><h4 className="mt-4 group-name">{groupName}</h4></div>

              <Button
                variant="primary"
                className="mt-3 "              
                onClick={() => handleSortGroupByPlaceNormally(groupName)}
              >
                <FontAwesomeIcon icon={faArrowDown19} className="me-2" />
                Sort Group by Place
              </Button>

              
              <Button
                variant="success"
                className="mt-3 ms-2"              
                onClick={() => handleSortGroupByBib(groupName)}
              >
                <FontAwesomeIcon icon={faShirt} className="me-2" />
                Sort Group by BIB
              </Button>
              <Button
                variant="info"
                className="mt-3 ms-2"
                style={{backgroundColor:'#4d1d99'}}
                onClick={() => handleSortGroupByPlace(groupName)}
              >
              <FontAwesomeIcon icon={faArrowDownUpAcrossLine} className="me-2" />
                Sort Group by Flip
              </Button>
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
                      <td className="align-middle bib">{result.bib_number}</td>
                      <td className="align-middle atlet">{result.competitor_info.name} {result.competitor_info.surname}</td>
                      <td className="align-middle">{result.competitor_info.year}</td>
                      <td className="align-middle">{result.competitor_info.school}</td>
                      <td className="align-middle">
                      <Form.Control
                        type="text"
                        value={editedRuns[result.id]?.run1 !== undefined ? editedRuns[result.id]?.run1 : result.run1}
                        onChange={(e) => handleRunChange(result.id, "run1", e.target.value)}
                        placeholder="00:00,00"
                        maxLength={8}
                      />

                      </td>
                      <td className="align-middle">
                        <Form.Control
                          type="text"
                          value={editedRuns[result.id]?.run2 !== undefined ? editedRuns[result.id]?.run2 : result.run2}
                          onChange={(e) => handleRunChange(result.id, "run2", e.target.value)}
                          placeholder="00:00,00"
                          maxLength={8}
                        />
                      </td>

                      <td className="align-middle">
                        <Button variant="warning" onClick={() => handleUpdate(result.id)}>
                        <FontAwesomeIcon icon={faCloudArrowUp}  className="me-2"/>
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
