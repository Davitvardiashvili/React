import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import axios, { HttpStatusCode } from "axios";
import axiosInstance from '../axiosInstance/axiosInstance';
import { notifyError, notifySuccess } from '../App';
import { Button, Table, Form, FormGroup, FormControl, Row, Col } from 'react-bootstrap';


const Competitor = () => {
    const [competitors, setCompetitors] = useState([]);
    const [schoolOptions, setSchoolOptions] = useState([]);
    const [newCompetitor, setNewCompetitor] = useState({
        name: '',
        surname: '',
        gender: '',
        year: '',
        school: '',
    });
    const [editingCompetitorId, setEditingCompetitorId] = useState(null);
    const [editCompetitorData, setEditCompetitorData] = useState({
        name: '',
        surname: '',
        gender: '',
        year: '',
        school: ''
    });

    useEffect(() => {
        // Fetch competitors
        axiosInstance.get('/competitor/')
            .then(response => {
                setCompetitors(response.data);
            })
            .catch(error => {
                console.error("Error fetching competitor data:", error);
            });
        axiosInstance.get('/school/')
            .then(response => {
                setSchoolOptions(response.data);
            })
            .catch(error => {
                console.error("Error fetching school data:", error);
            });

    }, []);

    const handleAddCompetitor = (e) => {
        e.preventDefault();

        // Updated: Use 'gender_id' and 'school_id' in the request body
        axiosInstance.post('/competitor/', {
            ...newCompetitor,
            gender_id: parseInt(newCompetitor.gender, 10),
            school_id: parseInt(newCompetitor.school, 10),
        })
            .then(response => {
                setCompetitors([...competitors, response.data]);
                setNewCompetitor({ name: '', surname: '', gender: '', year: '', school: '' });
                notifySuccess("სპორტსმენი წარმატებით დაემატა", "success");
            })
            .catch(error => {
                console.error('Error adding competitor:', error);
                notifyError("დაფიქსირდა შეცდომა სპორტსმენის დამატებისას", "error");
            });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewCompetitor(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const startEdit = (competitor) => {
        setEditingCompetitorId(competitor.id);
        setEditCompetitorData({
            name: competitor.name,
            surname: competitor.surname,
            gender_id: competitor.gender, // Ensure you use the correct field for gender ID
            year: competitor.year,
            school_id: competitor.school // Ensure you use the correct field for school ID
        });
    };

    const cancelEdit = () => {
        setEditingCompetitorId(null);
        setEditCompetitorData({ name: '', surname: '', gender: '', year: '', school: '' });
    };

    const handleUpdateCompetitor = (e) => {
        e.preventDefault();

        const genderId = genderOptions.find(gender => gender.name === editCompetitorData.gender_id)?.id
        const schoolId = schoolOptions.find(school => school.school_name === editCompetitorData.school_id)?.id
        const updatedData = {
            name: editCompetitorData.name,
            surname: editCompetitorData.surname,
            year: editCompetitorData.year,
            gender_id: Number(genderId) || null,
            school_id: Number(schoolId) || null,
        };
        // debugger

        axiosInstance.put(`/competitor/${editingCompetitorId}/`, updatedData,)
            .then(response => {
                setCompetitors(competitors.map(competitor =>
                    competitor.id === editingCompetitorId ? response.data : competitor
                ));
                cancelEdit();
                notifySuccess("სპორტსმენი წარმატებით შეიცვალა", "success");
            })
            .catch(error => {
                console.error('Error updating competitor:', error);
                notifyError("დაფიქსირდა შეცდომა სპორტსმენის შეცვლისას", "error");
            });
    };

    const genderOptions = [
        { id: '1', name: 'Male' },
        { id: '2', name: 'Female' }
    ];


    const handleDeleteCompetitor = (competitorId) => {
        const isConfirmed = window.confirm("დარწმუნებული ხარ რომ გსურს სპორტსმენის წაშლა?");

        if (isConfirmed) {
            axiosInstance.delete(`/competitor/${competitorId}/`,)
                .then(() => {
                    // Update the competitors state to remove the deleted competitor
                    setCompetitors(competitors.filter(competitor => competitor.id !== competitorId));
                    notifySuccess("სპორტსმენი წაიშალა წარმატებით", "success");
                })
                .catch(error => {
                    console.error('Error deleting competitor:', error);
                    notifyError("დაფიქსირდა შეცდომა სპორტსმენის წაშლისას", "error");
                });
        }
    };

    return (
        <div className="homeTable">
            <h5>დაამატე სპორტსმენი</h5>
            <hr></hr>
            <Form onSubmit={handleAddCompetitor}>
                <Row>
                    <Col md={2}>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                name="name"
                                value={newCompetitor.name}
                                onChange={handleChange}
                                placeholder="სახელი" />
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                name="surname"
                                value={newCompetitor.surname}
                                onChange={handleChange}
                                placeholder="გვარი" />
                        </Form.Group>
                    </Col>

                    <Col md={2}>
                        <Form.Group>
                            <Form.Control
                                as="select"
                                name="gender"
                                value={newCompetitor.gender}
                                onChange={handleChange}>
                                <option value="" disabled>სქესი</option>
                                <option value="1">კაცი</option>
                                <option value="2">ქალი</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                name="year"
                                value={newCompetitor.year}
                                onChange={handleChange}
                                placeholder="დაბ. წელი" />
                        </Form.Group>
                    </Col>


                    <Col md={2}>
                        <Form.Control
                            as="select"
                            name="school"
                            value={newCompetitor.school}
                            onChange={handleChange}>
                            <option value="" disabled>სკოლა</option>
                            {schoolOptions.map(option => (
                                <option key={option.id} value={option.id}>{option.school_name}</option>
                            ))}
                        </Form.Control>
                    </Col>
                    <Col md={2}>
                        <Button type="submit" variant="primary" className="w-100">დამატება</Button>
                    </Col>
                </Row>

            </Form>
            <hr className="mt-5"></hr>
            <div className="mb-4"><h4>სპორტსმენები</h4></div>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>სახელი</th>
                        <th>გვარი</th>
                        <th>სქესი</th>
                        <th>დაბ. წელი</th>
                        <th>სკოლა</th>
                        <th>მოქმედება</th>
                    </tr>
                </thead>
                <tbody>
                    {competitors.map(competitor => (
                        <tr key={competitor.id}>
                            <td className="align-middle">
                                {editingCompetitorId === competitor.id ? (
                                    <FormControl
                                        type="text"
                                        value={editCompetitorData.name}
                                        onChange={(e) => setEditCompetitorData({ ...editCompetitorData, name: e.target.value })}
                                    />
                                ) : (
                                    competitor.name
                                )}
                            </td>
                            <td className="align-middle">
                                {editingCompetitorId === competitor.id ? (
                                    <FormControl
                                        type="text"
                                        value={editCompetitorData.surname}
                                        onChange={(e) => setEditCompetitorData({ ...editCompetitorData, surname: e.target.value })}
                                    />
                                ) : (
                                    competitor.surname
                                )}
                            </td>
                            <td className="align-middle">
                                {editingCompetitorId === competitor.id ? (
                                    <FormControl
                                        as="select"
                                        value={editCompetitorData.gender}
                                        onChange={(e) => setEditCompetitorData({ ...editCompetitorData, gender_id: e.target.value })}
                                    >
                                        {genderOptions.map(option => (
                                            <option key={option.id} value={option.name} selected={option.name === competitor.gender}>
                                                {option.name}
                                            </option>
                                        ))}
                                    </FormControl>
                                ) : (
                                    competitor.gender
                                )}
                            </td>
                            <td className="align-middle">
                                {editingCompetitorId === competitor.id ? (
                                    <FormControl
                                        type="text"
                                        value={editCompetitorData.year}
                                        onChange={(e) => setEditCompetitorData({ ...editCompetitorData, year: e.target.value })}
                                    />
                                ) : (
                                    competitor.year
                                )}
                            </td>
                            <td className="align-middle">
                                {editingCompetitorId === competitor.id ? (
                                    <FormControl
                                        as="select"
                                        value={editCompetitorData.school}
                                        onChange={(e) => setEditCompetitorData({ ...editCompetitorData, school_id: e.target.value })}
                                    >
                                        {schoolOptions.map(option => (
                                            <option key={option.id} value={option.school_name} selected={option.school_name === competitor.school}>
                                                {option.school_name}
                                            </option>
                                        ))}
                                    </FormControl>
                                ) : (
                                    competitor.school
                                )}
                            </td>
                            <td className="align-middle">
                                {editingCompetitorId === competitor.id ? (
                                    <>
                                        <Button variant="success" onClick={handleUpdateCompetitor}>დამახსოვრება</Button>
                                        <Button className="ms-2" variant="secondary" onClick={cancelEdit}>გაუქმება</Button>
                                    </>
                                ) : (
                                    <Button variant="warning" onClick={() => startEdit(competitor)}>შეცვლა</Button>
                                )}
                                <Button className="ms-2" variant="danger" onClick={() => handleDeleteCompetitor(competitor.id)}>წაშლა</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>

    );
};

export default Competitor;