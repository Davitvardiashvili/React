import axios from "axios";
import React, { useEffect, useState } from "react";
import './css/cart.css';
import { Link } from "react-router-dom";
import axiosInstance from "../axiosInstance/axiosInstance";
import { notifyError, notifySuccess } from '../App';

const Cart = () => {
  const [competitorTable, setCompetitorTable] = useState([]);
  const [competitionTables, setCompetitionTables] = useState([]);
  const [groupTables, setGroupTables] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [competitionGroupsMap, setCompetitionGroupsMap] = useState({});
  const [cartMembers, setCartMembers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [draggedGroup, setDraggedGroup] = useState(null);
  const [startNumber, setStartNumber] = useState(1);
  const [ignoreNumbers, setIgnoreNumbers] = useState([0]);
  
  useEffect(() => {
    // Fetch competitors
    axios.get("http://localhost:8000/api/competitor/")
    .then((response) => {
      const fetchedCompetitorTable = response.data;
      const storedCompetitorTable = JSON.parse(localStorage.getItem('competitorTable')) || [];
      
      // Merge fetched and stored competitor data, avoiding duplicates
      const mergedCompetitorTable = [...fetchedCompetitorTable, ...storedCompetitorTable.filter(
        (storedCompetitor) => !fetchedCompetitorTable.some((fetchedCompetitor) => fetchedCompetitor.id === storedCompetitor.id)
      )];

      setCompetitorTable(mergedCompetitorTable);
    })
    .catch((error) => {
      console.error("Error fetching competitor data:", error);
    });

    // Fetch competitions
    axios.get("http://localhost:8000/api/competition/")
      .then((response) => {
        setCompetitionTables(response.data);
      })
      .catch((error) => {
        console.error("Error fetching competition data:", error);
      });

    // Fetch cart members
    axios.get("http://localhost:8000/api/cart/")
      .then((response) => {
        setCartMembers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching cart data:", error);
      });

    // Fetch groups
    axios.get("http://localhost:8000/api/group/")
      .then((response) => {
        setGroupTables(response.data);
      })
      .catch((error) => {
        console.error("Error fetching group data:", error);
      });
  }, []);


  

  // Function to fetch groups related to the selected competition
  const filterGroupsForCompetition = (competitionId) => {
    const filteredGroups = groupTables.filter((group) => group.competition.id == competitionId);
    setCompetitionGroupsMap({ ...competitionGroupsMap, [competitionId]: filteredGroups });
  };

  // Function to handle competition selection
  const handleCompetitionSelect = (event) => {
    const selectedCompetitionId = event.target.value;
    setSelectedCompetition(selectedCompetitionId);
  
    // Check if groups for the selected competition are already fetched
    if (!competitionGroupsMap[selectedCompetitionId]) {
      filterGroupsForCompetition(selectedCompetitionId);
    }
  
    // Filter competitors based on the selected competition and groups
    const competitorsInCart = competitionGroupsMap.map((cart) => cart.competitor.id);
    const groupsForSelectedCompetition = competitionGroupsMap[selectedCompetitionId] || [];
    
    // Get competitor IDs in groups for the selected competition
    const competitorsInGroups = groupsForSelectedCompetition
      .flatMap((group) => group.competitors.map((competitor) => competitor.id));
  
    // Filter competitors table based on the selected competition and groups
    const filteredCompetitorTable = competitorTable
      .filter((competitor) => !competitorsInCart.includes(competitor.id) && !competitorsInGroups.includes(competitor.id));
  
    setCompetitorTable(filteredCompetitorTable);
  };



  const handleDrop = (event) => {
    event.preventDefault();
    const competitorId = event.dataTransfer.getData("competitorId");

    // Make a POST request to add the competitor to the cart
    axiosInstance
      .post("/cart/", {
        competitor_id: parseInt(competitorId, 10),
        group_id: parseInt(draggedGroup, 10), // Use draggedGroup instead of selectedGroup
      })
      .then((response) => {
        axios
          .get("http://localhost:8000/api/cart/")
          .then((response) => {
            setCartMembers(response.data);
            notifySuccess("Competitor added successfully", "success");
          })
          .catch((error) => {
            console.error("Error fetching cart data:", error);
            notifyError("Failed to add Competitor into Group", "error");
          });
        setCompetitorTable((prevCompetitorTable) =>
          prevCompetitorTable.filter((competitor) => competitor.id !== parseInt(competitorId, 10))
        );
    
        // Save updated competitorTable to localStorage
        localStorage.setItem('competitorTable', JSON.stringify(filteredCompetitorTable));
      })
      .catch((error) => {
        console.error("Error adding competitor to cart:", error);
        notifyError("Failed to add Competitor into Group", "error");
      });
  };


  const handleDeleteCompetitor = (cartId) => {
    axiosInstance
      .delete(`/cart/${cartId}/`)
      .then(() => {
        // Refresh cart data after deletion
        axios
          .get("http://localhost:8000/api/cart/")
          .then((response) => {
            setCartMembers(response.data);
            notifySuccess("Competitor deleted successfully", "success");
          })
          .catch((error) => {
            console.error("Error fetching cart data:", error);
            notifyError("Failed to delete competitor from cart", "error");
          });
      })
      .catch((error) => {
        console.error("Error deleting competitor from cart:", error);
        notifyError("Failed to delete competitor from cart", "error");
      });
  };




  // Function to handle drag enter event and update the draggedGroup state
  const handleDragEnter = (groupId) => {
    setDraggedGroup(groupId);
  };

  // Function to handle drag start event and store competitor ID in the data transfer
  const handleDragStart = (event, competitorId) => {
    event.dataTransfer.setData("competitorId", competitorId);
  };

  // Function to handle drag over event and allow dropping
  const handleDragOver = (event) => {
    event.preventDefault();
  };








  const handleRandomize = () => {
    const genderId = 2; // Replace with the actual gender ID
    const competitionId = selectedCompetition;

    axiosInstance
      .post("/randomizer/", {
        start_number: startNumber,
        ignore_numbers: ignoreNumbers,
        competition: competitionId,
        gender: genderId,
      })
      .then((response) => {
        notifySuccess("Bib numbers randomized successfully", "success");

        // Refresh cart data after randomization
        axios
          .get("http://localhost:8000/api/cart/")
          .then((response) => {
            setCartMembers(response.data);
          })
          .catch((error) => {
            console.error("Error fetching cart data:", error);
          });
      })
      .catch((error) => {
        console.error("Error randomizing bib numbers:", error);
        notifyError("Failed to randomize bib numbers", "error");
      });
  };


  return (
    <div>
      <div>
        {/* Competition dropdown for selection */}
        <select value={selectedCompetition} onChange={handleCompetitionSelect}>
          <option value="">Select Competition</option>
          {competitionTables.map((competition) => (
            <option key={competition.id} value={competition.id}>
              {competition.stage.season.season} - {competition.stage.name} - {competition.discipline.discipline}
            </option>
          ))}
        </select>
      </div>

      <div className="two-tables-container">
        <div className="table-container">
          <div className="tableHeader">Competitors</div>
          <table className="table">
            <thead>
              <tr>
                <th>სახელი გვარი</th>
                <th>სქესი</th>
                <th>წელი</th>
                <th>სკოლა</th>
              </tr>
            </thead>
            <tbody>
              {competitorTable.map((competitor) => (
                <tr
                  key={competitor.id}
                  draggable
                  onDragStart={(event) => handleDragStart(event, competitor.id)}
                >
                  <td>{competitor.name} {competitor.surname}</td>
                  <td>{competitor.gender}</td>
                  <td>{competitor.year}</td>
                  <td>{competitor.school}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        

        <div
          className="table-container"
          onDrop={(event) => handleDrop(event)}
          onDragOver={(event) => handleDragOver(event)}
        >
          <div>
        <label>
          Start Number:
          <input
            type="number"
            value={startNumber}
            onChange={(e) => setStartNumber(Number(e.target.value))}
          />
        </label>

        <label>
          Ignore Numbers (comma-separated):
          <input
            type="text"
            value={ignoreNumbers.join(',')}
            onChange={(e) => setIgnoreNumbers(e.target.value.split(',').map(Number))}
          />
        </label>

        <button onClick={handleRandomize}>Randomize Bib Numbers</button>
      </div>
        {competitionGroupsMap[selectedCompetition]?.map((group) => (
            <div
              key={group.id}
              onDragEnter={() => handleDragEnter(group.id)}
            >
              <div className="tableHeader">{group.group_name}</div>
              <table className="table">
                <thead>
                  <tr>
                    <th>BIB</th>
                    <th>სახელი გვარი</th>
                    <th>სქესი</th>
                    <th>წელი</th>
                    <th>სკოლა</th>
                    <th>ამოშლა</th>
                  </tr>
                </thead>
                <tbody>
                {cartMembers
                    .filter((cart) => cart.group.id === group.id) // Filter cart members for the current group
                    .map((cart) => (
                      <tr key={cart.id}>
                        {/* Adjust the fields based on your cart data structure */}
                        <td>{cart.bib_number}</td>
                        <td>{cart.competitor.name} {cart.competitor.surname}</td>
                        <td>{cart.competitor.gender}</td>
                        <td>{cart.competitor.year}</td>
                        <td>{cart.competitor.school}</td>
                        <td>
                          {/* Button to delete competitor from cart */}
                          <button onClick={() => handleDeleteCompetitor(cart.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>  
            </div>      
            )
          )}
          
        </div>
      </div>
    </div>
  );
};

export default Cart;
