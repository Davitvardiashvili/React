import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from '../axiosInstance/axiosInstance';
import { Button, Table, Form, FormGroup, FormControl, Row, Col } from 'react-bootstrap';
import { notifyError, notifySuccess } from '../App';

const Season = () => {
    
    const [seasons, setSeasons] = useState([]);
    const [newSeasonName, setNewSeasonName] = useState('');
    const [editingSeasonId, setEditingSeasonId] = useState(null);
    const [editSeasonName, setEditSeasonName] = useState('');

    useEffect(() => {
        axios.get(`http://localhost:8000/api/season/`)
            .then((response) => {
                setSeasons(response.data);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }, []);

    const handleAddSeason = (e) => {
        e.preventDefault();
    
    
        axiosInstance.post('/season/', { season: newSeasonName })
        .then(response => {
            setSeasons([...seasons, response.data]);
            setNewSeasonName('');
            notifySuccess("სეზონი წარმატებით დაემატა", "success");
        })
        .catch(error => {
            console.error('Error adding season:', error);
            notifyError("დაფიქსირდა შეცდომა სეზონის დამატებისას", "error");
        });
    };


    const handleDeleteSeason = (seasonId) => {
        const isConfirmed = window.confirm("დარწმუნებული ხარ რომ გსურს სეზონის წაშლა?");
    
        if (isConfirmed) {
            
            axiosInstance.delete(`/season/${seasonId}`)
            .then(() => {
                // Update the state to remove the deleted school
                setSeasons(seasons.filter(season => season.id !== seasonId));
                notifySuccess("სეზონი წაიშალა წარმატებით", "success");
            })
            .catch(error => {
                console.error('Error deleting Season:', error);
                notifyError("დაფიქსირდა შეცდომა სეზონის წაშლისას", "error");
            });
        }
    };

    const startEdit = (season) => {
        setEditingSeasonId(season.id);
        setEditSeasonName(season.season);
    };
    
    const cancelEdit = () => {
        setEditingSeasonId(null);
        setEditSeasonName('');
    };


    const handleUpdateSeason = (e, seasonId) => {
        e.preventDefault();
    
       
        
        axiosInstance.put(`/season/${seasonId}/`, { season: editSeasonName })
        .then(response => {
            setSeasons(seasons.map(season => season.id === seasonId ? response.data : season));
            cancelEdit();
            notifySuccess("სეზონი შეიცვალა წარმატებით", "success");
        })
        .catch(error => {
            console.error('Error updating season:', error);
            notifyError("დაფიქსირდა შეცდომა სეზონის შეცვლისას", "error");
        });
    };


    return (
        <div className="homeTable container">
            <h5>დაამატე სეზონი</h5>
            <hr></hr>
            <Form onSubmit={handleAddSeason} className="mb-3">
                <Row>
                    <Col md={2}>
                    <Form.Group controlId="seasonName">
                        <Form.Control 
                            type="text"
                            value={newSeasonName}
                            onChange={(e) => setNewSeasonName(e.target.value)}
                            placeholder="შეიყვანე სეზონის სახელი"
                        />
                    </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Button variant="primary" type="submit">დამატება</Button>
                    </Col>
                </Row>
            </Form>
            <hr className="mt-5"></hr>
            <div className="mb-4"><h4>სეზონები</h4></div>

        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>სეზონი</th>
                    <th>მოქმედება</th>
                </tr>
            </thead>
            <tbody>
                {seasons.map(season => (
                    <tr key={season.id}>
                        <td className="align-middle">
                            {editingSeasonId === season.id ? (
                                <Form.Control 
                                    type="text" 
                                    value={editSeasonName} 
                                    onChange={(e) => setEditSeasonName(e.target.value)} 
                                />
                            ) : (
                                season.season
                            )}
                        </td>
                        <td className="align-middle">
                            {editingSeasonId === season.id ? (
                            <>
                                <Button variant="success" onClick={handleUpdateSeason}>დამახსოვრება</Button>
                                <Button variant="secondary" onClick={cancelEdit} className="ms-2">გაუქმება</Button>
                            </>
                            ) : (
                                <Button variant="warning" onClick={() => startEdit(season)}>შეცვლა</Button>
                            )}
                            <Button className="ms-2" variant="danger" onClick={() => handleDeleteSeason(season.id)}>წაშლა</Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
        </div>
    );
};

export default Season;
