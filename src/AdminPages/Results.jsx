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
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [sortedResultIds, setSortedResultIds] = useState([]);

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
    setSelectedCompetition(filter);
    applyFilter(filter);
  };

  const handleRunChange = (id, field, value) => {
    var formattedValue;
    if (value.length > 1){
      var hours = value.slice(0,2);
      formattedValue = `${hours}:`
    }else{
      formattedValue = value
    }
    if (value.length > 3){
      var minutes = value.slice(2,4)
      formattedValue = `${hours}:${minutes}`
    }else{
      formattedValue = value
    }
    if (value.length > 5){
      var seconds = value.slice(4,6)
      formattedValue = `${hours}:${minutes},${seconds}`
    }else{
      formattedValue = value
    }



    // Update the state
    setEditedRuns((prevRuns) => ({
      ...prevRuns,
      [id]: {
        ...prevRuns[id],
        [field]: formattedValue,
      },
    }));
  };
  
  
  
  
  
  

  // const handleRunChange = (id, field, value) => {
  //   // Check if the value contains integers
  //   const hasIntegers = /^\d+$/.test(value);
  
  //   // Add a colon after the first two symbols
  //   let updatedValue = value.slice(0, 2);
  //   // let test = value.slice(0,5)
  //   // Add another colon after the first five symbols if the value contains integers
  //   if (hasIntegers && value.length > 2) {
  //     updatedValue += ':' + value.slice(2, 4);
  //   } else {
  //     // console.log(updatedValue)
  //     if (updatedValue.length === 5){
  //       updatedValue += ',' + value.slice(4,);
  //       console.log(updatedValue)
  //     }
  //     updatedValue += value.slice(2);
  //     console.log(updatedValue.length)
  //   }

  
  //   // Update the state
  //   setEditedRuns((prevRuns) => ({
  //     ...prevRuns,
  //     [id]: {
  //       ...prevRuns[id],
  //       [field]: updatedValue,
  //     },
  //   }));
  // };

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

    const sortByPlace = (data) => {
    return [...data].sort((a, b) => a.place - b.place);
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
  
    // Sort competitors by place
    const sortedGroup = sortByPlace(groupCompetitors);
  
    // Reverse the order of the first five competitors
    const reversedFirstFive = sortedGroup.slice(0, 5);
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
  
  
  

  const handleDownloadPDF = () => {
    if (!selectedCompetition) {
      notifyError("Please select a competition first", "error");
      return;
    }

    console.log(sortedResultIds)

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
        link.setAttribute('download', `Results_${selectedCompetition}.pdf`);  // Set the desired filename
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
          <Form.Control as="select" value={selectedFilter} onChange={(e) => handleFilterChange(e.target.value)}>
            <option value="">Select Season - Stage - Discipline</option>
            {filterOptions.map((filter) => (
              <option key={filter} value={filter}>
                {filter}
              </option>
            ))}
          </Form.Control>

          <Button variant="primary" className="mt-3" onClick={handleSortSwitch}>
            {`Sort by ${sortMethod === 'bib' ? 'Place' : 'BIB'}`}
          </Button>
          <Button variant="info" className="ms-2 mt-3" onClick={handleDownloadPDF}>PDF - ის ჩამოტვირთვა</Button>

          {sortedResults && Object.keys(sortedResults).map((groupName) => (
            <div key={groupName} className="rudika">
              <div className="groupform"><h4 className="mt-4 group-name">{groupName}</h4></div>
              <Button
                variant="info"
                className="mt-3"
                style={{backgroundColor:'#4d1d99'}}
                onClick={() => handleSortGroupByPlace(groupName)}
              >
                Sort by Flip
              </Button>
              <Button
                variant="success"
                className="mt-3"
                style={{ marginLeft: '10px' }}
              
                onClick={() => handleSortGroupByPlaceNormally(groupName)}
              >
                Sort by Place
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
                          maxLength={8}
                        />
                      </td>
                      <td className="align-middle">
                        <Form.Control
                          type="text"
                          value={editedRuns[result.id]?.run2 || ""}
                          onChange={(e) => handleRunChange(result.id, "run2", e.target.value)}
                          placeholder="00:00,00"
                          maxLength={8}
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
