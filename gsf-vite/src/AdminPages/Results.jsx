import axios from "axios";
import React, { useEffect, useState } from "react";
import axiosInstance from '../axiosInstance/axiosInstance';
import { notifyError, notifySuccess } from '../App';

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
        statusId: parseInt(newStatusId),
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

      // Initialize editedRuns with actual run1 and run2 values
      setEditedRuns((prevRuns) => ({
        ...prevRuns,
        [item.id]: {
          run1: item.run1 || "",
          run2: item.run2 || "",
        },
      }));
    });

    setFilterOptions(Array.from(filterSet));
  };


  const handleUpdate = async (id) => {
    try {
      const { run1, run2, statusId } = editedRuns[id] || {};
      // Send a PUT request to update the record
      axiosInstance.put(`/results/${id}/`, { run1, run2, status_id: statusId }).then(far => {
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
    <div className="resultsTable">
      <div>
        <select
          value={selectedFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
        >
          <option value="">Select Season - Stage - Discipline</option>
          {filterOptions.map((filter) => (
            <option key={filter} value={filter}>
              {filter}
            </option>
          ))}
        </select>

        {Object.keys(sortedResults).map((groupName) => (
          <div key={groupName}>
            <div className="tableHeader">
              <h4>{groupName}</h4>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>სახელი</th>
                  <th>გვარი</th>
                  <th>სკოლა</th>
                  <th>BIB</th>
                  <th>დაბ.წელი</th>
                  <th>სქესი</th>
                  
                  <th>დრო 1</th>
                  <th>დრო 2</th>
                  <th>ჯამური დრო</th>
                  <th>სტატუსი</th>
                  <th>ქულა</th>
                  <th>სეზონის ქულა</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
              {sortedResults[groupName]?.map((result) => (
                  <tr key={result.id}>
                    <td>{result.place}</td>
                    <td>{result.competitor.name}</td>
                    <td>{result.competitor.surname}</td>
                    <td>{result.competitor.school}</td>
                    <td>{result.cart_detail.bib_number}</td>
                    <td>{result.competitor.year}</td>
                    <td>{result.competitor.gender}</td>
                    <td>
                      <input
                        type="text"
                        value={editedRuns[result.id]?.run1 || ""}
                        onChange={(e) =>
                          handleRunChange(result.id, "run1", e.target.value)
                        }
                        placeholder="00:00,00"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editedRuns[result.id]?.run2 || ""}
                        onChange={(e) =>
                          handleRunChange(result.id, "run2", e.target.value)
                        }
                        placeholder="00:00,00"
                      />
                    </td>
                    <td>{result.run_total}</td>
                    <td>
                      <select
                        value={editedRuns[result.id]?.statusId || result.statusId}
                        onChange={(e) => handleStatusChange(result.id, e.target.value)}
                      >
                        <option value="1">Active</option>
                        <option value="2">DNF</option>
                        <option value="3">DNS</option>
                      </select>
                    </td>
                    <td>{result.point}</td>
                    <td>{result.season_point}</td>
                    <td>
                      <button onClick={() => handleUpdate(result.id)}>
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Results;
