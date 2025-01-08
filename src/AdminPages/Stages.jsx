import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "../axiosInstance/axiosInstance";
import { Button, Table, Form, Row, Col } from "react-bootstrap";
import { notifyError, notifySuccess } from "../App";
import { globalUrl } from "../App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFloppyDisk,
  faPenToSquare,
  faPlus,
  faTrashCan,
  faBan,
} from "@fortawesome/free-solid-svg-icons";

const Stages = () => {
  const [stages, setStages] = useState([]);
  const [seasonOptions, setSeasonOptions] = useState([]);

  // For creating a new stage
  const [newStage, setNewStage] = useState({
    season: "",   // will store Season ID
    name: "",
    location: "",
  });

  // For editing an existing stage
  const [editingStageId, setEditingStageId] = useState(null);
  const [editStageData, setEditStageData] = useState({
    season: "",   // Season ID
    name: "",
    location: "",
  });

  // -------------------------
  // Fetch data on mount
  // -------------------------
  useEffect(() => {
    // Fetch stages
    axios
      .get(`${globalUrl.url}/api/stage/`)
      .then((response) => {
        setStages(response.data);
      })
      .catch((error) => {
        console.error("Error fetching Stages data:", error);
      });

    // Fetch seasons
    axios
      .get(`${globalUrl.url}/api/season/`)
      .then((response) => {
        setSeasonOptions(response.data); // array of {id, season, ...}
      })
      .catch((error) => {
        console.error("Error fetching seasons data:", error);
      });
  }, []);

  // -------------------------
  // CREATE a new stage
  // -------------------------
  const handleAddStage = (e) => {
    e.preventDefault();

    // Build payload for POST
    const payload = {
      season_id: parseInt(newStage.season, 10),
      name: newStage.name,
      location: newStage.location || "", // optional
    };

    axiosInstance
      .post("/stage/", payload)
      .then((response) => {
        setStages([...stages, response.data]);
        setNewStage({ season: "", name: "", location: "" });
        notifySuccess("ეტაპი წარმატებით დაემატა", "success");
      })
      .catch((error) => {
        console.error("Error adding stage:", error);
        notifyError("დაფიქსირდა შეცდომა ეტაპის დამატებისას", "error");
      });
  };

  // Handle form changes for creating stage
  const handleNewStageChange = (e) => {
    const { name, value } = e.target;
    setNewStage((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -------------------------
  // EDIT mode
  // -------------------------
  const startEdit = (stage) => {
    setEditingStageId(stage.id);
    setEditStageData({
      season: stage.season.id, // store the Season ID
      name: stage.name,
      location: stage.location || "",
    });
  };

  const cancelEdit = () => {
    setEditingStageId(null);
    setEditStageData({ season: "", name: "", location: "" });
  };

  // -------------------------
  // UPDATE an existing stage
  // -------------------------
  const handleUpdateStage = (e) => {
    e.preventDefault();

    const payload = {
      season_id: parseInt(editStageData.season, 10),
      name: editStageData.name,
      location: editStageData.location || "",
    };

    axiosInstance
      .put(`/stage/${editingStageId}/`, payload)
      .then((response) => {
        setStages(
          stages.map((st) => (st.id === editingStageId ? response.data : st))
        );
        cancelEdit();
        notifySuccess("ეტაპი წარმატებით შეიცვალა", "success");
      })
      .catch((error) => {
        console.error("Error updating stage:", error);
        notifyError("დაფიქსირდა შეცდომა ეტაპის შეცვლისას", "error");
      });
  };

  // -------------------------
  // DELETE a stage
  // -------------------------
  const handleDeleteStage = (stageId) => {
    const isConfirmed = window.confirm("დარწმუნებული ხარ რომ გსურს წაშლა?");

    if (isConfirmed) {
      axiosInstance
        .delete(`/stage/${stageId}`)
        .then(() => {
          setStages(stages.filter((stage) => stage.id !== stageId));
          notifySuccess("ეტაპი წაიშალა წარმატებით", "success");
        })
        .catch((error) => {
          console.error("Error deleting stage:", error);
          notifyError("დაფიქსირდა შეცდომა ეტაპის წაშლისას", "error");
        });
    }
  };

  return (
    <div className="homeTable container">
      <h5>დაამატე ეტაპი</h5>
      <hr />
      <Form onSubmit={handleAddStage} className="mb-3">
        <Row>
          {/* Stage name */}
          <Col md={3}>
            <Form.Group>
              <Form.Control
                type="text"
                name="name"
                value={newStage.name}
                onChange={handleNewStageChange}
                placeholder="ეტაპის სახელი"
              />
            </Form.Group>
          </Col>

          {/* Optional Location */}
          <Col md={3}>
            <Form.Group>
              <Form.Control
                type="text"
                name="location"
                value={newStage.location}
                onChange={handleNewStageChange}
                placeholder="ლოკაცია (არასავალდებულო)"
              />
            </Form.Group>
          </Col>

          {/* Season select */}
          <Col md={2}>
            <Form.Group>
              <Form.Select
                name="season"
                value={newStage.season}
                onChange={handleNewStageChange}
              >
                <option value="" disabled>
                  აირჩიე სეზონი
                </option>
                {seasonOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.season}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Submit button */}
          <Col md={2}>
            <Button type="submit" variant="success">
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              დამატება
            </Button>
          </Col>
        </Row>
      </Form>

      <hr className="mt-5" />
      <div className="mb-4">
        <h4>ეტაპები</h4>
      </div>

      <Table hover>
        <thead>
          <tr>
            <th>ეტაპის სახელი</th>
            <th>ლოკაცია</th>
            <th>სეზონი</th>
            <th>მოქმედება</th>
          </tr>
        </thead>
        <tbody>
          {stages.map((stage) => (
            <tr key={stage.id}>
              {/* Stage Name */}
              <td className="align-middle">
                {editingStageId === stage.id ? (
                  <Form.Control
                    type="text"
                    value={editStageData.name}
                    onChange={(e) =>
                      setEditStageData({ ...editStageData, name: e.target.value })
                    }
                  />
                ) : (
                  stage.name
                )}
              </td>

              {/* Location */}
              <td className="align-middle">
                {editingStageId === stage.id ? (
                  <Form.Control
                    type="text"
                    value={editStageData.location}
                    onChange={(e) =>
                      setEditStageData({
                        ...editStageData,
                        location: e.target.value,
                      })
                    }
                  />
                ) : (
                  stage.location || ""
                )}
              </td>

              {/* Season */}
              <td className="align-middle">
                {editingStageId === stage.id ? (
                  <Form.Select
                    value={editStageData.season}
                    onChange={(e) =>
                      setEditStageData({ ...editStageData, season: e.target.value })
                    }
                  >
                    <option value="">აირჩიე სეზონი</option>
                    {seasonOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.season}
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  stage.season?.season
                )}
              </td>

              {/* Actions */}
              <td>
                {editingStageId === stage.id ? (
                  <>
                    <Button onClick={handleUpdateStage} variant="success">
                      <FontAwesomeIcon icon={faFloppyDisk} className="me-2" />
                      დამახსოვრება
                    </Button>
                    <Button
                      onClick={cancelEdit}
                      variant="secondary"
                      className="ms-2"
                    >
                      <FontAwesomeIcon icon={faBan} className="me-2" />
                      გაუქმება
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => startEdit(stage)} variant="warning">
                      <FontAwesomeIcon icon={faPenToSquare}/>
                    </Button>
                    <Button
                      className="ms-2"
                      onClick={() => handleDeleteStage(stage.id)}
                      variant="danger"
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
    </div>
  );
};

export default Stages;
