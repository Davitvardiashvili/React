import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from '../axiosInstance/axiosInstance';
import { notifyError, notifySuccess } from '../App';
import { Button, Table, Form, FormGroup, FormControl, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk, faPenToSquare, faPlus, faTrashCan, faBan } from '@fortawesome/free-solid-svg-icons';
import { globalUrl } from "../App";
const School = () => {

    const [schools, setSchools] = useState([]);
    const [newSchoolName, setNewSchoolName] = useState('');
    const [editingSchoolId, setEditingSchoolId] = useState(null);
    const [editSchoolName, setEditSchoolName] = useState('');

    useEffect(() => {
        axios.get(`${globalUrl.url}/api/school/`)
            .then((response) => {
                setSchools(response.data);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }, []);

    const handleAddSchool = (e) => {
        e.preventDefault();


        axiosInstance.post('/school/', { name: newSchoolName })
            .then(response => {
                setSchools([...schools, response.data]);
                setNewSchoolName('');
                notifySuccess("სკოლა წარმატებით დაემატა", "success");
            })
            .catch(error => {
                console.error('Error adding school:', error);
                notifyError("დაფიქსირდა შეცდომა სკოლის დამატებისას", "error");
            });
    };


    const handleDeleteSchool = (schoolId) => {
        const isConfirmed = window.confirm("Are you sure to delete this school?");

        if (isConfirmed) {

            axiosInstance.delete(`/school/${schoolId}`)
                .then(() => {
                    setSchools(schools.filter(school => school.id !== schoolId));
                    notifySuccess("სკოლა წაიშალა წარმატებით", "success");
                })
                .catch(error => {
                    console.error('Error deleting school:', error);
                    notifyError("დაფიქსირდა შეცდომა სკოლის წაშლისას", "error");
                });
        }
    };

    const startEdit = (school) => {
        setEditingSchoolId(school.id);
        setEditSchoolName(school.name);
    };

    const cancelEdit = () => {
        setEditingSchoolId(null);
        setEditSchoolName('');
    };


    const handleUpdateSchool = (e, schoolId) => {
        e.preventDefault();



        axiosInstance.put(`/school/${schoolId}/`, { name: editSchoolName })
            .then(response => {
                setSchools(schools.map(school => school.id === schoolId ? response.data : school));
                cancelEdit();
                notifySuccess("სკოლა შეიცვალა წარმატებით", "success");
            })
            .catch(error => {
                console.error('Error updating school:', error);
                notifyError("დაფიქსირდა შეცდომა სკოლის შეცვლისას", "error");
            });
    };


    return (
        <div className="homeTable container koko">
            <h5>დაამატე სკოლა</h5>
            <hr></hr>
            <Form onSubmit={handleAddSchool} className="mb-3">
                <FormGroup as={Row}>
                    <Col sm="3">
                        <FormControl
                            type="text"
                            value={newSchoolName}
                            onChange={(e) => setNewSchoolName(e.target.value)}
                            placeholder="შეიყვანეთ სკოლის სახელი"
                        />
                    </Col>
                    <Col sm="auto">
                        
                        <Button variant="success" type="submit">
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                            დამატება</Button>
                    </Col>
                </FormGroup>
            </Form>

            <hr className="mt-5"></hr>
            <div className="mb-4"><h4>სკოლები</h4></div>
            <Table hover>
                <thead>
                    <tr>
                        <th>სკოლა</th>
                        <th>მოქმედება</th>
                    </tr>
                </thead>
                <tbody>
                    {schools.map(school => (
                        <tr key={school.id}>
                            <td className="align-middle">
                                {editingSchoolId === school.id ? (
                                    <FormControl
                                        type="text"
                                        value={editSchoolName}
                                        onChange={(e) => setEditSchoolName(e.target.value)}
                                    />
                                ) : (
                                    school.name
                                )}
                            </td>
                            <td className="align-middle">
                                <span>
                                    {editingSchoolId === school.id ? (
                                        <>
                                            <Button variant="success" onClick={(e) => handleUpdateSchool(e, school.id)}>
                                            <FontAwesomeIcon icon={faFloppyDisk} className="me-2" />
                                                დამახსოვრება</Button>
                                            <Button className="ms-2" variant="secondary" onClick={cancelEdit}>
                                            <FontAwesomeIcon icon={faBan} className="me-2" />
                                                გაუქმება</Button>
                                        </>
                                    ) : (
                                        <Button variant="warning" onClick={() => startEdit(school)}>
                                            <FontAwesomeIcon icon={faPenToSquare}/>
                                            </Button>
                                    )}
                                </span>
                                <span className="ms-2">
                                    <Button variant="danger" onClick={() => handleDeleteSchool(school.id)}>
                                    <FontAwesomeIcon icon={faTrashCan} />
                                        </Button>
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default School;
