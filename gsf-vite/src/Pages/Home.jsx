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
        setResults(response.data);
        extractFilterOptions(response.data);
        setFilteredResults(response.data); // Initialize filtered results
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
                  <th>ქულა</th>
                  <th>სეზონის ქულა</th>
                </tr>
              </thead>
              <tbody>
                {groupedResults[groupName]?.map((result) => (
                  <tr key={result.id}>
                    <td>{result.place}</td>
                    <td>{result.competitor.name}</td>
                    <td>{result.competitor.surname}</td>
                    <td>{result.competitor.school}</td>
                    <td>{result.cart_detail.bib_number}</td>
                    <td>{result.competitor.year}</td>
                    <td>{result.competitor.gender}</td>
                    <td>{result.run1}</td>
                    <td>{result.run2}</td>
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
