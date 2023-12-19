import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./css/home.css";

const Home = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [stages, setStages] = useState([]);
  const [seasonStagesMap, setSeasonStagesMap] = useState({});
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
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
    const seasonMap = {};
  
    data.forEach(item => {
      const seasonName = item.cart_detail.group.stage.discipline.season.season;
      const stageName = item.cart_detail.group.stage.name;
  
      if (!seasonMap[seasonName]) {
        seasonMap[seasonName] = new Set();
      }
      seasonMap[seasonName].add(stageName);
    });
  
    setSeasons(Object.keys(seasonMap));
    setSeasonStagesMap(seasonMap);
  };
  
  const handleSeasonChange = (season) => {
    setSelectedSeason(season);
    setStages(Array.from(seasonStagesMap[season] || []));
    setSelectedStage(''); // Reset stage selection
    applyFilter(season, ''); // Apply filter with reset stage
  };

  const handleStageChange = (stage) => {
    setSelectedStage(stage);
    applyFilter(selectedSeason, stage);
  };

  const applyFilter = (season, stage) => {
    const filtered = results.filter(result => {
      const matchesSeason = season ? result.cart_detail.group.stage.discipline.season.season === season : true;
      const matchesStage = stage ? result.cart_detail.group.stage.name === stage : true;
      return matchesSeason && matchesStage;
    });
    setFilteredResults(filtered);
    setGroupedResults(organizeDataByGroups(filtered));
  };



  const organizeDataByGroups = (data) => {
    const groups = {};
  
    data.forEach(result => {
      const groupName = result.cart_detail.group.grop_name; // Ensure this matches your data structure
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
        <select value={selectedSeason} onChange={(e) => handleSeasonChange(e.target.value)}>
          <option value="">Select Season</option>
          {seasons.map(season => (
            <option key={season} value={season}>{season}</option>
          ))}
        </select>
        <select value={selectedStage} onChange={(e) => handleStageChange(e.target.value)}>
          <option value="">Select Stage</option>
          {stages.map(stage => (
            <option key={stage} value={stage}>{stage}</option>
          ))}
        </select>

        {Object.keys(groupedResults).map(groupName => (
          <div key={groupName}>
            <div className="tableHeader"><h4>{groupName}</h4></div>
            <table>
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
              {groupedResults[groupName].map(result => (
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
            </table>
          </div>
        ))}
      
      </div>
    </div>
  );
};

export default Home;