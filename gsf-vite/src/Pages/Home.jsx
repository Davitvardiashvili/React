import axios from "axios";
import React, { useEffect, useState } from "react";
import "./css/home.css";

const Home = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [filterOptions, setFilterOptions] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [groupedResults, setGroupedResults] = useState({});

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/results/")
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

    const sortedFilteredResults = sortByPlace(filtered);
    setFilteredResults(sortedFilteredResults);
    setGroupedResults(organizeDataByGroups(sortedFilteredResults));
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
  
    // Sort each group by place
    Object.keys(groups).forEach((group) => {
      groups[group] = sortByPlace(groups[group]);
    });
  
    return groups;
  };






  return (
    <div className="homeTable">
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

        {Object.keys(groupedResults).map((groupName) => (
          <div key={groupName}>
            <div className="tableHeader">
              <h4>{groupName}</h4>
            </div>
            <table>
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
                  <th>სტატუსი</th>
                  <th>ჯამური დრო</th>
                  <th>ქულა</th>
                  <th>სეზონის ქულა</th>
                </tr>
              </thead>
              <tbody>
                {groupedResults[groupName]?.map((result) => (
                  <tr key={result.id}>
                    <td>{result.place}</td>
                    <td>{result.competitor.name} {result.competitor.surname}</td>
                    <td>{result.cart_detail.bib_number}</td>
                    <td>{result.competitor.gender}</td>
                    <td>{result.competitor.year}</td>
                    <td>{result.competitor.school}</td>
                    <td>{result.run1}</td>
                    <td>{result.run2}</td>
                    <td>{result.status}</td>
                    <td>{result.run_total}</td>
                    <td>{result.point}</td>
                    <td>{result.season_point}</td>
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

export default Home;
