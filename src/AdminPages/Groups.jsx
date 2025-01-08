import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "../axiosInstance/axiosInstance";
import { Button, Table, Form, Row, Col, Pagination } from "react-bootstrap";
import { notifyError, notifySuccess } from "../App";
import { globalUrl } from "../App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faPenToSquare, faPlus, faTrashCan, faBan } from "@fortawesome/free-solid-svg-icons";

const AgeGroups = () => {
  // -----------------------------
  // State
  // -----------------------------
  const [ageGroups, setAgeGroups] = useState([]);
  const [seasonOptions, setSeasonOptions] = useState([]);
  const [genderOptions, setGenderOptions] = useState([]);

  // For adding a new AgeGroup
  const [newAgeGroup, setNewAgeGroup] = useState({
    season: "",
    gender: "",
    birth_year_start: "",
    birth_year_end: "",
  });

  // For editing an AgeGroup
  const [editingAgeGroupId, setEditingAgeGroupId] = useState(null);
  const [editAgeGroupData, setEditAgeGroupData] = useState({
    season: "",
    gender: "",
    birth_year_start: "",
    birth_year_end: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const groupsPerPage = 12;

  // -----------------------------
  // Fetch data on mount
  // -----------------------------
  useEffect(() => {
    // Fetch AgeGroups
    axios
      .get(`${globalUrl.url}/api/age-group/`)
      .then((response) => {
        setAgeGroups(response.data);
      })
      .catch((error) => {
        console.error("Error fetching ageGroup data:", error);
      });

    // Fetch Seasons
    axios
      .get(`${globalUrl.url}/api/season/`)
      .then((response) => {
        setSeasonOptions(response.data);
      })
      .catch((error) => {
        console.error("Error fetching seasons:", error);
      });

    // Fetch Genders
    axios
      .get(`${globalUrl.url}/api/gender/`)
      .then((response) => {
        setGenderOptions(response.data);
      })
      .catch((error) => {
        console.error("Error fetching genders:", error);
      });
  }, []);

  // -----------------------------
  // Pagination Logic
  // -----------------------------
  const indexOfLastGroup = currentPage * groupsPerPage;
  const indexOfFirstGroup = indexOfLastGroup - groupsPerPage;
  const currentGroups = ageGroups.slice(indexOfFirstGroup, indexOfLastGroup);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // -----------------------------
  // Create AgeGroup
  // -----------------------------
  const handleAddAgeGroup = (e) => {
    e.preventDefault();

    // Convert empty strings to null for birth_year_end
    const payload = {
      season_id: parseInt(newAgeGroup.season, 10),
      gender_id: parseInt(newAgeGroup.gender, 10),
      birth_year_start: newAgeGroup.birth_year_start
        ? parseInt(newAgeGroup.birth_year_start, 10)
        : null,
      birth_year_end: newAgeGroup.birth_year_end
        ? parseInt(newAgeGroup.birth_year_end, 10)
        : null,
    };

    axiosInstance
      .post("/age-group/", payload)
      .then((response) => {
        setAgeGroups([...ageGroups, response.data]);
        setNewAgeGroup({
          season: "",
          gender: "",
          birth_year_start: "",
          birth_year_end: "",
        });
        notifySuccess("AgeGroup დაემატა წარმატებით", "success");
      })
      .catch((error) => {
        console.error("Error adding AgeGroup:", error);
        notifyError("შეცდომა მოხდა AgeGroup-ის დამატებისას", "error");
      });
  };

  // -----------------------------
  // Form handlers
  // -----------------------------
  const handleNewChange = (e) => {
    const { name, value } = e.target;
    setNewAgeGroup((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Start edit mode
  const startEdit = (ag) => {
    setEditingAgeGroupId(ag.id);
    setEditAgeGroupData({
      season: ag.season.id, // assuming the response has "season": {id:..., name:...}
      gender: ag.gender.id, // similarly "gender": {id:..., name:...}
      birth_year_start: ag.birth_year_start || "",
      birth_year_end: ag.birth_year_end || "",
    });
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingAgeGroupId(null);
    setEditAgeGroupData({
      season: "",
      gender: "",
      birth_year_start: "",
      birth_year_end: "",
    });
  };

  // Update AgeGroup
  const handleUpdateAgeGroup = (e) => {
    e.preventDefault();

    const payload = {
      season_id: parseInt(editAgeGroupData.season, 10),
      gender_id: parseInt(editAgeGroupData.gender, 10),
      birth_year_start: editAgeGroupData.birth_year_start
        ? parseInt(editAgeGroupData.birth_year_start, 10)
        : null,
      birth_year_end: editAgeGroupData.birth_year_end
        ? parseInt(editAgeGroupData.birth_year_end, 10)
        : null,
    };

    axiosInstance
      .put(`/age-group/${editingAgeGroupId}/`, payload)
      .then((response) => {
        setAgeGroups(
          ageGroups.map((ag) => (ag.id === editingAgeGroupId ? response.data : ag))
        );
        cancelEdit();
        notifySuccess("AgeGroup წარმატებით შეიცვალა", "success");
      })
      .catch((error) => {
        console.error("Error updating AgeGroup:", error);
        notifyError("შეცდომა მოხდა AgeGroup-ის შეცვლისას", "error");
      });
  };

  // Delete AgeGroup
  const handleDeleteAgeGroup = (id) => {
    const isConfirmed = window.confirm("დარწმუნებული ხარ რომ გსურს წაშლა?");
    if (isConfirmed) {
      axiosInstance
        .delete(`/age-group/${id}/`)
        .then(() => {
          setAgeGroups(ageGroups.filter((ag) => ag.id !== id));
          notifySuccess("AgeGroup წაიშალა წარმატებით", "success");
        })
        .catch((error) => {
          console.error("Error deleting AgeGroup:", error);
          notifyError("შეცდომა მოხდა AgeGroup-ის წაშლისას", "error");
        });
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="homeTable container">
      <h5>ახალი ასაკობრივი ჯგუფი</h5>
      <hr />
      <Form onSubmit={handleAddAgeGroup} className="mb-3">
        <Row>
          {/* Season */}
          <Col md={3}>
            <Form.Group className="mb-2">
              <Form.Select
                name="season"
                value={newAgeGroup.season}
                onChange={handleNewChange}
              >
                <option value="">აირჩიე სეზონი</option>
                {seasonOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.season}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Gender */}
          <Col md={2}>
            <Form.Group className="mb-2">
              <Form.Select
                name="gender"
                value={newAgeGroup.gender}
                onChange={handleNewChange}
              >
                <option value="">სქესი</option>
                {genderOptions.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {/* birth_year_start */}
          <Col md={2}>
            <Form.Group className="mb-2">
              <Form.Control
                type="number"
                name="birth_year_start"
                value={newAgeGroup.birth_year_start}
                onChange={handleNewChange}
                placeholder="დაბ. წელი (დასაწყისი)"
              />
                <Form.Text className="text-muted">
                დატოვე ცარიელი თუ საწყისი ზღვარი არ არის
              </Form.Text>
            </Form.Group>
          </Col>

          {/* birth_year_end */}
          <Col md={2}>
            <Form.Group className="mb-2">
              <Form.Control
                type="number"
                name="birth_year_end"
                value={newAgeGroup.birth_year_end}
                onChange={handleNewChange}
                placeholder="დაბ. წელი (დასასრული)"
              />

            </Form.Group>
          </Col>

          <Col md={2}>
            <Button variant="success" type="submit">
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              დამატება
            </Button>
          </Col>
        </Row>
      </Form>

      <hr className="mt-5" />
      <div className="mb-4">
        <h4>ასაკობრივი ჯგუფები</h4>
      </div>

      <Table hover>
        <thead>
          <tr>
            <th>სეზონი</th>
            <th>სქესი</th>
            <th>დაბ. წელი (დასაწყისი)</th>
            <th>დაბ. წელი (დასასრული)</th>
            <th>მოქმედება</th>
          </tr>
        </thead>
        <tbody>
          {currentGroups.map((ag) => (
            <tr key={ag.id}>
              <td className="align-middle">
                {editingAgeGroupId === ag.id ? (
                  <Form.Select
                    value={editAgeGroupData.season}
                    onChange={(e) =>
                      setEditAgeGroupData({
                        ...editAgeGroupData,
                        season: e.target.value,
                      })
                    }
                  >
                    {seasonOptions.map((so) => (
                      <option key={so.id} value={so.id}>
                        {so.season}
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  ag.season.season
                )}
              </td>

              <td className="align-middle">
                {editingAgeGroupId === ag.id ? (
                  <Form.Select
                    value={editAgeGroupData.gender}
                    onChange={(e) =>
                      setEditAgeGroupData({
                        ...editAgeGroupData,
                        gender: e.target.value,
                      })
                    }
                  >
                    {genderOptions.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  ag.gender
                )}
              </td>

              <td className="align-middle">
                {editingAgeGroupId === ag.id ? (
                  <Form.Control
                    type="number"
                    value={editAgeGroupData.birth_year_start}
                    onChange={(e) =>
                      setEditAgeGroupData({
                        ...editAgeGroupData,
                        birth_year_start: e.target.value,
                      })
                    }
                  />
                ) : (
                  ag.birth_year_start || ""
                )}
              </td>

              <td className="align-middle">
                {editingAgeGroupId === ag.id ? (
                  <Form.Control
                    type="number"
                    value={editAgeGroupData.birth_year_end}
                    onChange={(e) =>
                      setEditAgeGroupData({
                        ...editAgeGroupData,
                        birth_year_end: e.target.value,
                      })
                    }
                  />
                ) : (
                  ag.birth_year_end === null ? "↓" : ag.birth_year_end
                )}
              </td>

              <td className="align-middle">
                {editingAgeGroupId === ag.id ? (
                  <>
                    <Button variant="success" onClick={handleUpdateAgeGroup}>
                      <FontAwesomeIcon icon={faFloppyDisk} className="me-2" />
                      დამახსოვრება
                    </Button>
                    <Button variant="secondary" onClick={cancelEdit} className="ms-2">
                      <FontAwesomeIcon icon={faBan} className="me-2" />
                      გაუქმება
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="warning" onClick={() => startEdit(ag)}>
                      <FontAwesomeIcon icon={faPenToSquare}/>
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteAgeGroup(ag.id)}
                      className="ms-2"
                    >
                      <FontAwesomeIcon icon={faTrashCan} />
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <Pagination>
        {Array.from({ length: Math.ceil(ageGroups.length / groupsPerPage) }, (_, index) => (
          <Pagination.Item
            key={index + 1}
            active={index + 1 === currentPage}
            onClick={() => paginate(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    </div>
  );
};

export default AgeGroups;
