import axios from "axios";
import React, { useEffect, useState } from "react";
import './css/cart.css';
import axiosInstance from "../axiosInstance/axiosInstance";
import { notifyError, notifySuccess } from '../App';
import { Button, Table, Form,Container, Row, Col } from 'react-bootstrap';

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

  const columnStyles = {
    width: '250px', // You can adjust the width as needed
  };

  useEffect(() => {
    // Fetch competitors
    axios.get("http://localhost:8000/api/competitor/")
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
    const selectedCompetitionId = event.target.value;
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
          .get("http://localhost:8000/api/cart/")
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
          .get("http://localhost:8000/api/cart/")
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
    const competitionId = selectedCompetition;
  
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
    <Container>
      <Row className="mb-3">
        <Col>
          <Form.Control as="select" value={selectedCompetition} onChange={handleCompetitionSelect}>
            <option value="" disabled>აირჩიე შეჯიბრის დღე</option>
            {competitionTables.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.stage.season.season} - {competition.stage.name} - {competition.discipline.discipline}
              </option>
            ))}
          </Form.Control>
        </Col>
        <Col>
          <Button variant="warning" onClick={handleSyncResults}>შედეგების სინქრონიზაცია</Button>
          <Button variant="success" className="ms-2" onClick={handleDownloadExcel}>Excel - ის ჩამოტვირთვა</Button>
          <Button variant="info" className="ms-2" onClick={handleDownloadPDF}>PDF - ის ჩამოტვირთვა</Button>

        </Col>
      </Row>


      
        <Row>
        <Col className="table-container" >
          <hr className="mt-3"></hr>
          <div className="mb-4"><h4>სპორტსმენები</h4></div>
          <Row className="mb-3">
              {/* Filter by Gender */}
              <Col>
                <Form.Control as="select" value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
                  <option value="" disabled>სქესი</option>
                  <option value="კაცი">კაცი</option>
                  <option value="ქალი">ქალი</option>
                </Form.Control>
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
          <Form.Group>
            <Form.Label>საწყისი რიცხვი</Form.Label>
            <Form.Control
              type="number"
              value={startNumber}
              onChange={(e) => setStartNumber(Number(e.target.value))}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label className="mt-2">გამონაკლისი რიცხვები (მძიმით გამოყავით)</Form.Label>
            <Form.Control
              type="text"
              value={ignoreNumbers.join(',')}
              onChange={(e) => setIgnoreNumbers(e.target.value.split(',').map(Number))}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label className="mt-2">აირჩიეთ სქესი</Form.Label>
            <Form.Control as="select" value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)}>
              <option value="1">კაცი</option>
              <option value="2">ქალი</option>
            </Form.Control>
          </Form.Group>

          <Button className="mt-3" onClick={handleRandomize}>კენჭისყრა</Button>

          {competitionGroupsMap[selectedCompetition]?.map((group) => (
            <div key={group.id} onDragEnter={() => handleDragEnter(group.id)}>
              <hr className="mt-5"></hr>
              <div className="mb-4"><h5>{group.group_name}</h5></div>
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
