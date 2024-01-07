import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from '../axiosInstance/axiosInstance';
import { Button, Table, Form, FormGroup, FormControl, Row, Col } from 'react-bootstrap';
import { notifyError, notifySuccess } from '../App';


const Stages = () => {
    
    const [stages, setStages] = useState([]);
    const [newStage, setNewStage] = useState({
        season:'',
        name:''
    });
    const [editingStageId, setEditingStageId] = useState(null);
    const [editStageData, setEditStageData] = useState({
        season:'',
        name:''
    });

    const [seasonOptions, setSeasonsOptions] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:8000/api/stage/`)
            .then((response) => {
              setStages(response.data);
            })
            .catch((error) => {
                console.error("Error fetching Stages data:", error);
            });

        axios.get(`http://localhost:8000/api/season/`)
            .then(response => {
                setSeasonsOptions(response.data);
            })
            .catch(error => {
                console.error("Error fetching seasons data:", error);
            });
    }, []);

    const handleAddStage = (e) => {
        e.preventDefault();
    
    
        axiosInstance.post('/stage/', { 
            ...newStage,
            season_id: parseInt(newStage.season,10)
        })
        .then(response => {
            setStages([...stages, response.data]);
            setNewStage({  season:'', name:''});
            notifySuccess("ეტაპი წარმატებით დაემატა", "success");
        })
        .catch(error => {
            console.error('Error adding stage:', error);
            notifyError("დაფიქსირდა შეცდომა ეტაპის დამატებისას", "error");
        });
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewStage(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const startEdit = (stage) => {
        setEditingStageId(stage.id);
        setEditStageData({
            name: stage.name,
            season_id: stage.season.season,
            // Ensure you use the correct field for school ID
        });
    };

    const cancelEdit = () => {
        setEditingStageId(null);
        setEditStageData({ name:'', season:''});
    };


    const handleUpdateStage = (e) => {
        e.preventDefault();
    
        const seasonId = seasonOptions.find(season => season.season === editStageData.season_id)?.id
        const updatedData = {
            name: editStageData.name,
            season_id: Number(seasonId) || null,
        };
        
        axiosInstance.put(`/stage/${editingStageId}/`, updatedData,)
        .then(response => {
            setStages(stages.map(stage => 
              stage.id === editingStageId ? response.data : stage
            ));
            cancelEdit();
            notifySuccess("ეტაპი წარმატებით შეიცვალა", "success");
        })
        .catch(error => {
            console.error('Error updating stage:', error);
            notifyError("დაფიქსირდა შეცდომა ეტაპის შეცვლისას", "error");
        });
    };


    const handleDeleteStage = (stageId) => {
        const isConfirmed = window.confirm("Are you sure to delete this Stage?");
    
        if (isConfirmed) {
            
            axiosInstance.delete(`/stage/${stageId}`)
            .then(() => {
                // Update the state to remove the deleted school
                setStages(stages.filter(stage => stage.id !== stageId));
                notifySuccess("ეტაპი წაიშალა წარმატებით", "success");
            })
            .catch(error => {
                console.error('Error deleting stage:', error);
                notifyError("დაფიქსირდა შეცდომა ეტაპის წაშლისას", "error");
            });
        }
    };

    return (
        <div className="homeTable container">
            <h5>დაამატე ეტაპი</h5>
            <hr></hr>
            <Form onSubmit={handleAddStage} className="mb-3">
                <Row>
                    <Col md={2}>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                name="name"
                                value={newStage.name}
                                onChange={handleChange}
                                placeholder="შეიყვანე ეტაპის სახელი"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group>
                            <Form.Control as="select" name="season" value={newStage.season} onChange={handleChange}>
                                <option value="" disabled>სეზონი</option>
                                {seasonOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.season}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Button type="submit" variant="primary">დამატება</Button>
                    </Col>
                </Row>
            </Form>
            <hr className="mt-5"></hr>
            <div className="mb-4"><h4>ეტაპები</h4></div>
            
            <Table striped hover>
                <thead>
                    <tr>
                        <th>ეტაპის სახელი</th>
                        <th>სეზონი</th>
                        <th>მოქმედება</th>
                    </tr>
                </thead>
                <tbody>
                    {stages.map(stage => (
                        <tr key={stage.id}>
                            <td className="align-middle" >
                                {editingStageId === stage.id ? (
                                    <Form.Control 
                                        type="text" 
                                        value={editStageData.name} 
                                        onChange={(e) => setEditStageData({...editStageData, name: e.target.value})} 
                                    />
                                ) : (
                                    stage.name
                                )}
                            </td>
                            <td className="align-middle">
                                {editingStageId === stage.id ? (
                                    <Form.Control as="select"
                                        value={editStageData.season}
                                        onChange={(e) => setEditStageData({...editStageData, season_id: e.target.value})}
                                    >
                                        {seasonOptions.map(option => (
                                            <option key={option.id} value={option.season} selected={option.season === stage.season.season}>
                                                {option.season}
                                            </option>
                                        ))}
                                    </Form.Control>
                                ) : (
                                    stage.season.season
                                )}
                            </td>
                            <td>
                                {editingStageId === stage.id ? (
                                    <>
                                        <Button onClick={handleUpdateStage} variant="success">დამახსოვრება</Button>
                                        <Button onClick={cancelEdit} variant="secondary" className="ms-2">გაუქმება</Button>
                                    </>
                                ) : (
                                    <Button onClick={() => startEdit(stage)} variant="warning">შეცვლა</Button>
                                )}
                                <Button className="ms-2" onClick={() => handleDeleteStage(stage.id)} variant="danger">წაშლა</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
    
};

export default Stages;
