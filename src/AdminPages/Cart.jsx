import axios from "axios";
import React, { useEffect, useState } from "react";
import './css/cart.css';
import axiosInstance from "../axiosInstance/axiosInstance";
import { notifyError, notifySuccess } from '../App';
import { Button, Table, Form,Container, Row, Col } from 'react-bootstrap';
import { globalUrl } from "../App";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDice,faFileExcel,faFilePdf,faRotate } from '@fortawesome/free-solid-svg-icons';

const Cart = () => {
  const [competitorTable, setCompetitorTable] = useState([]);
  const [competitionTables, setCompetitionTables] = useState([]);
  const [groupTables, setGroupTables] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [competitionGroupsMap, setCompetitionGroupsMap] = useState({});
  const [cartMembers, setCartMembers] = useState([]);
  const [draggedGroup, setDraggedGroup] = useState(null);
  const [startNumber, setStartNumber] = useState(1);
  const [ignoreNumbers, setIgnoreNumbers] = useState([]);
  const [originalCompetitorTable, setOriginalCompetitorTable] = useState([]);
  const [selectedGender, setSelectedGender] = useState("2");
  const [filterGender, setFilterGender] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterName, setFilterName] = useState('');
  const [competitionName, setCompetitionName] = useState('');

  const [competitions, setCompetitions] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('');



  useEffect(() => {
    // Fetch competitions
    axios.get(`${globalUrl.url}/api/competition`)
      .then(response => {
        setCompetitions(response.data);
        setCompetitionTables(response.data);
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
      // Filter competitions based on selected season, stage, and discipline
      const filteredCompetitions = competitions.filter(competition => 
        competition.stage.season.season === selectedSeason &&
        competition.stage.name === selectedStage &&
        competition.discipline.discipline === event.target.value
      );
  
      // Extract competition IDs
      const competitionIds = filteredCompetitions.map(competition => competition.id);
      
      console.log("Filtered Competition IDs:", competitionIds);
  
      // Call handleCompetitionSelect with the filtered competition IDs
      handleCompetitionSelect(competitionIds);
      setSelectedCompetition(competitionIds);
      setCompetitionName("სეზონი - " + selectedSeason + " - " + selectedStage + " - " + event.target.value)
    } else {
      console.log("Some of the filters are not selected.");
    }
  };
  

  const columnStyles = {
    width: '250px', // You can adjust the width as needed
  };

  useEffect(() => {
    // Fetch competitors
    axios.get(`${globalUrl.url}/api/competitor/`)
    .then((response) => {
      const fetchedCompetitorTable = response.data;
      setOriginalCompetitorTable(fetchedCompetitorTable);

      const storedCompetitorTable = JSON.parse(localStorage.getItem('competitorTable')) || [];
      const mergedCompetitorTable = [...fetchedCompetitorTable, ...storedCompetitorTable.filter(
        (storedCompetitor) => !fetchedCompetitorTable.some((fetchedCompetitor) => fetchedCompetitor.id === storedCompetitor.id)
      )];

      setCompetitorTable(mergedCompetitorTable);
    })
    .catch((error) => {
      console.error("Error fetching competitor data:", error);
    });

    // Fetch cart members
    axios.get(`${globalUrl.url}/api/cart/`)
      .then((response) => {
        setCartMembers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching cart data:", error);
      });

    // Fetch groups
    axios.get(`${globalUrl.url}/api/group/`)
      .then((response) => {
        setGroupTables(response.data);
      })
      .catch((error) => {
        console.error("Error fetching group data:", error);
      });
  }, []);


  const handleDownloadExcel = () => {
    if (!selectedCompetition) {
      notifyError("Please select a competition first", "error");
      return;
    }
  
    const cartIdsForSelectedCompetition = cartMembers
      .filter((cart) => competitionGroupsMap[selectedCompetition].some(group => group.id === cart.group.id))
      .map((cart) => cart.id);
  
    if (cartIdsForSelectedCompetition.length > 0) {
      axiosInstance.post('/download_excel/', { cartIds: cartIdsForSelectedCompetition }, {
        responseType: 'blob',
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', "Start List - " + selectedCompetition + '.xlsx');  // The download attribute specifies the filename.
        document.body.appendChild(link);
        link.click();
        link.remove();  // Remove the element after clicking it.
        window.URL.revokeObjectURL(url);  // Free up memory by revoking the object URL.
      })
      .catch((error) => {
        console.error('Error downloading Excel file:', error);
        notifyError("Failed to download Excel file", "error");
      });
    } else {
      notifyError("No competitors in the selected competition", "error");
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedCompetition) {
      notifyError("Please select a competition first", "error");
      return;
    }
  
    const cartIdsForSelectedCompetition = cartMembers
      .filter((cart) => competitionGroupsMap[selectedCompetition].some(group => group.id === cart.group.id))
      .map((cart) => cart.id);
  
    if (cartIdsForSelectedCompetition.length > 0) {
      axiosInstance.post('/download_pdf/', { cartIds: cartIdsForSelectedCompetition }, {
        responseType: 'blob',
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data], {
          type: 'application/pdf'
        }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', "Start List - " + selectedCompetition + '.pdf');  // The download attribute specifies the filename.
        document.body.appendChild(link);
        link.click();
        link.remove();  // Remove the element after clicking it.
        window.URL.revokeObjectURL(url);  // Free up memory by revoking the object URL.
      })
      .catch((error) => {
        console.error('Error downloading PDF file:', error);
        notifyError("Failed to download PDF file", "error");
      });
    } else {
      notifyError("No competitors in the selected competition", "error");
    }
  };



 
  const handleCompetitionSelect = (event) => {
    const selectedCompetitionId = event;
    setSelectedCompetition(selectedCompetitionId);
  
    if (!selectedCompetitionId) {
      // No competition selected, show the entire competitor table
      setCompetitorTable(originalCompetitorTable);
      return;
    }
  
    const filteredGroups = groupTables.filter((group) => group.competition.id == selectedCompetitionId);
    setCompetitionGroupsMap({ ...competitionGroupsMap, [selectedCompetitionId]: filteredGroups });
  
    const groupIds = filteredGroups.map((group) => group.id);
  
    // Filter cartMembers based on group IDs
    const competitorsInSelectedGroups = cartMembers.filter((cart) =>
      groupIds.includes(cart.group.id)
    );
  
    console.log(competitorsInSelectedGroups);
  
    const filteredCompetitorTable = originalCompetitorTable.filter(
      (competitor) => !competitorsInSelectedGroups.some((cart) => cart.competitor.id === competitor.id)
    );
  
    console.log(filteredCompetitorTable);
  
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
          .get(`${globalUrl.url}/api/cart/`)
          .then((response) => {
            setCartMembers(response.data);
            notifySuccess("სპორტსმენი წარმატებით დაემატა", "success");
          })
          .catch((error) => {
            console.error("Error fetching cart data:", error);
            notifyError("Failed to add Competitor into Group", "error");
          });
        setCompetitorTable((prevCompetitorTable) =>
          prevCompetitorTable.filter((competitor) => competitor.id !== parseInt(competitorId, 10))
        );
    
        // Save updated competitorTable to localStorage
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
        // Update the cartMembers state after deletion
        axios
          .get(`${globalUrl.url}/api/cart/`)
          .then((response) => {
            setCartMembers(response.data);
            notifySuccess("სპორტსმენი წარმატებით წაიშალა ჯგუფიდან", "success");
          })
          .catch((error) => {
            console.error("Error fetching cart data:", error);
            notifyError("Failed to delete competitor from cart", "error");
          });
  
        // Find the deleted competitor in the cartMembers list
        const deletedCart = cartMembers.find((cart) => cart.id === cartId);
        const deletedCompetitorId = deletedCart.competitor.id;
  
        // Add the deleted competitor back to the filtered competitor list
        setCompetitorTable((prevCompetitorTable) => [
          ...prevCompetitorTable,
          originalCompetitorTable.find((competitor) => competitor.id === deletedCompetitorId),
        ]);
      })
      .catch((error) => {
        console.error("Error deleting competitor from cart:", error);
        notifyError("Failed to delete competitor from cart", "error");
      });
  };
  
  
  

  // Function to handle drag enter event and update the draggedGroup state
  const handleDragEnter = (groupId) => {
    if (groupId !== draggedGroup) {
      setDraggedGroup(groupId);
    }
  };

  // Function to handle drag start event and store competitor ID in the data transfer
  const handleDragStart = (event, competitorId) => {
    event.dataTransfer.setData("competitorId", competitorId);
  };

  // Function to handle drag over event and allow dropping
  const handleDragOver = (event) => {
    event.preventDefault();
  
    // Get the Y position of the cursor
    const mouseY = event.clientY;
  
    // Get the container element (the right side table)
    const container = document.querySelector('.table-container');
  
    // Calculate the scroll position based on the cursor position
    const scrollSpeed = 5;
    const scrollThreshold = 50;
  
    if (mouseY > container.offsetHeight - scrollThreshold) {
      // Scroll down
      container.scrollTop += scrollSpeed;
    } else if (mouseY < scrollThreshold) {
      // Scroll up
      container.scrollTop -= scrollSpeed;
    }
  };

  const handleRandomize = () => {
    const competitionId = selectedCompetition[0];
  
    axiosInstance
      .post("/randomizer/", {
        start_number: startNumber,
        ignore_numbers: ignoreNumbers,
        competition: competitionId,
        gender: parseInt(selectedGender),
      })
      .then((response) => {
        notifySuccess("კენჭისყრა დასრულდა წარმატებით", "success");
  
        // Refresh cart data after randomization
        axios
          .get(`${globalUrl.url}/api/cart/`)
          .then((response) => {
            setCartMembers(response.data);
          })
          .catch((error) => {
            console.error("Error fetching cart data:", error);
          });
      })
      .catch((error) => {
        console.error("Error randomizing bib numbers:", error);
        notifyError("დაფიქსირდა შეცდომა კენჭისყრის მცდელობისას", "error");
      });
  };




  const handleSyncResults = () => {
    // Extract an array of cart IDs from cartMembers
    const cartIds = cartMembers.map((cart) => cart.id);
  
    // Send a single POST request with an array of cart IDs
    axiosInstance
    .post("/batch_sync_results/", {
      cart_ids: cartIds,
    })
    .then((response) => {
      // Handle success, e.g., show a success message
      console.log("Results synced successfully:", response.data.message);
      notifySuccess("მონაცემები დასინქრონდა", "success");
    })
    .catch((error) => {
      // Handle error, e.g., show an error message
      console.error("Error syncing results:", error);
    });
};

  return (
    <Container className="mb-3">
      <Row>
      <div className="mb-2"><h6>{competitionName}</h6></div>
      <hr className=""></hr>

      

        <Col className="table-container" >
          <Row className="mt-2">
            <div className="mb-4"><h4>შეჯიბრი</h4></div>
          <Col sm={'3'}>
            <Form.Select as="select" value={selectedSeason} onChange={handleSeasonChange}>
                <option value="" disabled>სეზონი</option>
                {seasons.map(season => (
                  <option key={season} value={season}>{season}</option>
                ))}
            </Form.Select>
            </Col>

            <Col sm={"5"}>
              <Form.Select  as="select" value={selectedStage} onChange={handleStageChange}>
                <option value="" disabled>ეტაპი</option>
                {stages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </Form.Select>
            </Col>
            <Col sm={"4"}>

              <Form.Select  as="select" value={selectedDiscipline} onChange={handleDisciplineChange}>
                <option value="" disabled>დისციპლინა</option>
                {disciplines.map(discipline => (
                  <option key={discipline} value={discipline}>{discipline}</option>
                ))}
              </Form.Select>
            </Col>

          </Row>
          <hr className="mt-3"></hr>
          <div className="mb-4"><h4>სპორტსმენები</h4></div>
          <Row className="mb-3">
              {/* Filter by Gender */}
              <Col>
                <Form.Select as="select" value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
                  <option value="" disabled>სქესი</option>
                  <option value="კაცი">კაცი</option>
                  <option value="ქალი">ქალი</option>
                </Form.Select>
              </Col>

              {/* Filter by Year */}
              <Col>
                <Form.Control 
                  type="number" 
                  placeholder="წელი"
                  value={filterYear} 
                  onChange={(e) => setFilterYear(e.target.value)}
                />
              </Col>

              {/* Filter by Name/Surname */}
              <Col>
                <Form.Control 
                  type="text" 
                  placeholder="სახელი ან გვარი"
                  value={filterName} 
                  onChange={(e) => setFilterName(e.target.value)}
                />
              </Col>
            </Row>
          <Table striped hover>
            <thead>
              <tr>
                <th style={columnStyles}>სახელი გვარი</th>
                <th>სქესი</th>
                <th>წელი</th>
                <th>სკოლა</th>
              </tr>
            </thead>
            <tbody>
              {competitorTable
                .filter((competitor) => {
                  return (
                    (!filterGender || competitor.gender === filterGender) &&
                    (!filterYear || competitor.year.toString() === filterYear) &&
                    (!filterName || competitor.name.toLowerCase().includes(filterName.toLowerCase()) || competitor.surname.toLowerCase().includes(filterName.toLowerCase()))
                  );
                })
                .map((competitor) => (
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
          </Table>
        </Col>

        <Col className="table-container"    onDrop={(event) => handleDrop(event)}
          onDragOver={(event) => handleDragOver(event)}>
          {/* Form for inputs and selects */}
          <Row>
            <Col>
              <div className="mb-4"><h4>კალათა</h4></div>
            </Col>
            <Col>
              <Button variant="success" className="ms-2" onClick={handleDownloadExcel}>
              <FontAwesomeIcon icon={faFileExcel} className="me-2" />
                Excel Start List</Button>
              <Button variant="danger" className="ms-2" onClick={handleDownloadPDF}>
              <FontAwesomeIcon icon={faFilePdf} className="me-2" />
                PDF Start List</Button>
            </Col>
          </Row>
          <Row>
            <Col sm={2}>
              <Form.Group>
                <Form.Label>საწ.რიცხვი</Form.Label>
                <Form.Control
                  type="number"
                  value={startNumber}
                  onChange={(e) => setStartNumber(Number(e.target.value))}
                />
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group>
                <Form.Label>გამონაკლისი რიცხვები</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="მაგალითად (3,28,11)"
                  onChange={(e) => setIgnoreNumbers(e.target.value.split(',').map(Number))}
                />
              </Form.Group>
            </Col>
            <Col sm={3}>
              <Form.Group>
                <Form.Label>სქესი</Form.Label>
                <Form.Select as="select" value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)}>
                  <option value="1">კაცი</option>
                  <option value="2">ქალი</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mt-3">

            <Col>
            <Button onClick={handleRandomize}>
              <FontAwesomeIcon icon={faDice} className="me-2" />
              კენჭისყრა
            </Button>
            <Button className="ms-3" variant="warning" onClick={handleSyncResults}>
            <FontAwesomeIcon icon={faRotate} className="me-2" />
              სინქრონიზაცია</Button>
            </Col>
                      
          </Row>



          {competitionGroupsMap[selectedCompetition]?.map((group) => (
            <div key={group.id} onDragEnter={() => handleDragEnter(group.id)}>
              <hr className="mt-5"></hr>
              <div className=" groupform"><h5 className="group-name1">{group.group_name}</h5></div>
              <Table striped hover>
                <thead>
                  <tr> 
                    <th>BIB</th>
                    <th style={columnStyles}>სახელი გვარი</th>
                    <th>სქესი</th>
                    <th>წელი</th>
                    <th>სკოლა</th>
                    <th>მოქმედება</th>
                  </tr>
                </thead>
                <tbody>
                  {cartMembers
                    .filter((cart) => cart.group.id === group.id)
                    .sort((a, b) => a.bib_number - b.bib_number)
                    .map((cart) => (
                      <tr key={cart.id}>
                        <td>{cart.bib_number}</td>
                        <td>{cart.competitor.name} {cart.competitor.surname}</td>
                        <td>{cart.competitor.gender}</td>
                        <td>{cart.competitor.year}</td>
                        <td>{cart.competitor.school}</td>
                        <td>
                          <Button variant="danger" onClick={() => handleDeleteCompetitor(cart.id)}>
                            ამოშლა
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

export default Cart;
