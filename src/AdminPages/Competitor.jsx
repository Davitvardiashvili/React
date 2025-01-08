import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import axios, { HttpStatusCode } from "axios";
import axiosInstance from '../axiosInstance/axiosInstance';
import { notifyError, notifySuccess } from '../App';
import { Button, Table, Form, FormGroup, FormControl, Row, Col, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk, faPenToSquare, faPlus, faTrashCan, faBan } from '@fortawesome/free-solid-svg-icons';

const Competitor = () => {
    const [competitors, setCompetitors] = useState([]);
    const [schoolOptions, setSchoolOptions] = useState([]);
    const [filterGender, setFilterGender] = useState('');
    const [filterSchool, setFilterSchool] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [filterName, setFilterName] = useState('');
    const [newCompetitor, setNewCompetitor] = useState({
        first_name: '',
        last_name: '',
        gender: '',
        year_of_birth: '',
        school: '',
    });
    const [editingCompetitorId, setEditingCompetitorId] = useState(null);
    const [editCompetitorData, setEditCompetitorData] = useState({
        first_name: '',
        last_name: '',
        gender: '',
        year_of_birth: '',
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
    const [currentPage, setCurrentPage] = useState(1);
    const competitorsPerPage = 10;

    const filteredCompetitors = competitors.filter((competitor) => {
        return (
            (!filterGender || competitor.gender === filterGender) &&
            (!filterYear || competitor.year_of_birth.toString() === filterYear) &&
            (!filterSchool || competitor.school === filterSchool) &&
            (!filterName || competitor.first_name.toLowerCase().includes(filterName.toLowerCase()) || competitor.last_name.toLowerCase().includes(filterName.toLowerCase()))
        );
    });

    // Calculate the index of the last competitor on the current page
    const indexOfLastCompetitor = currentPage * competitorsPerPage;
    // Calculate the index of the first competitor on the current page
    const indexOfFirstCompetitor = indexOfLastCompetitor - competitorsPerPage;
    // Get the current competitors for the current page from the filtered list
    const currentCompetitors = filteredCompetitors.slice(indexOfFirstCompetitor, indexOfLastCompetitor);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                setNewCompetitor({ first_name: '', last_name: '', gender: '', year_of_birth: '', school: '' });
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
            first_name: competitor.first_name,
            last_name: competitor.last_name,
            gender_id: competitor.gender, // Ensure you use the correct field for gender ID
            year_of_birth: competitor.year_of_birth,
            school_id: competitor.school // Ensure you use the correct field for school ID
        });
    };

    const cancelEdit = () => {
        setEditingCompetitorId(null);
        setEditCompetitorData({ first_name: '', last_name: '', gender: '', year_of_birth: '', school: '' });
    };

    const handleUpdateCompetitor = (e) => {
        e.preventDefault();

        const genderId = genderOptions.find(gender => gender.name === editCompetitorData.gender_id)?.id
        const schoolId = schoolOptions.find(school => school.name === editCompetitorData.school_id)?.id
        const updatedData = {
            first_name: editCompetitorData.first_name,
            last_name: editCompetitorData.last_name,
            year_of_birth: editCompetitorData.year_of_birth,
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
        { id: '1', name: 'კაცი' },
        { id: '2', name: 'ქალი' }
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
        <div className="homeTable container">
            <h5>დაამატე სპორტსმენი</h5>
            <hr></hr>
            <Form onSubmit={handleAddCompetitor}>
                <Row>
                    <Col md={2}>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                name="first_name"
                                value={newCompetitor.first_name}
                                onChange={handleChange}
                                placeholder="სახელი" />
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                name="last_name"
                                value={newCompetitor.last_name}
                                onChange={handleChange}
                                placeholder="გვარი" />
                        </Form.Group>
                    </Col>

                    <Col md={2}>
                        <Form.Group>
                            <Form.Select
                                as="select"
                                name="gender"
                                value={newCompetitor.gender}
                                onChange={handleChange}>
                                <option value="" disabled>სქესი</option>
                                <option value="1">კაცი</option>
                                <option value="2">ქალი</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                name="year_of_birth"
                                value={newCompetitor.year_of_birth}
                                onChange={handleChange}
                                placeholder="დაბ. წელი" />
                        </Form.Group>
                    </Col>


                    <Col md={2}>
                        <Form.Select
                            as="select"
                            name="school"
                            value={newCompetitor.school}
                            onChange={handleChange}>
                            <option value="" disabled>სკოლა</option>
                            {schoolOptions.map(option => (
                                <option key={option.id} value={option.id}>{option.name}</option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col md={2}>
                        <Button type="submit" variant="success" className="w-100">
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                            დამატება</Button>
                    </Col>
                </Row>

            </Form>
            <hr className="mt-5"></hr>
            <div className="mb-3"><h5>გაფილტრე</h5></div>
            <Row className="mb-3">
                <Col md={3}>
                    <Form.Control
                        type="text"
                        placeholder="სახელი ან გვარი"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                    />
                </Col>

                <Col md={2}>
                    <Form.Select as="select" value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
                        <option value="">სქესი</option>
                        <option value="კაცი">კაცი</option>
                        <option value="ქალი">ქალი</option>
                    </Form.Select>
                </Col>

                <Col md={2}>
                    <Form.Control
                        type="number"
                        placeholder="წელი"
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                    />
                </Col>
                <Col md={2}>
                    <Form.Select
                        as="select"
                        value={filterSchool}
                        onChange={(e) => setFilterSchool(e.target.value)}>
                        <option value="">სკოლა</option>
                        {schoolOptions.map(option => (
                            <option key={option.id} value={option.name}>{option.name}</option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>

            <Table hover>
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
                    {currentCompetitors
                    .filter((competitor) => {
                        return (
                            (!filterGender || competitor.gender === filterGender) &&
                            (!filterYear || competitor.year_of_birth.toString() === filterYear) &&
                            (!filterName || competitor.first_name.toLowerCase().includes(filterName.toLowerCase()) || competitor.last_name.toLowerCase().includes(filterName.toLowerCase()))
                        );
                        })
                    .map(competitor => (
                        <tr key={competitor.id}>
                            <td className="align-middle">
                                {editingCompetitorId === competitor.id ? (
                                    <FormControl
                                        type="text"
                                        value={editCompetitorData.first_name}
                                        onChange={(e) => setEditCompetitorData({ ...editCompetitorData, first_name: e.target.value })}
                                    />
                                ) : (
                                    competitor.first_name
                                )}
                            </td>
                            <td className="align-middle">
                                {editingCompetitorId === competitor.id ? (
                                    <FormControl
                                        type="text"
                                        value={editCompetitorData.last_name}
                                        onChange={(e) => setEditCompetitorData({ ...editCompetitorData, last_name: e.target.value })}
                                    />
                                ) : (
                                    competitor.last_name
                                )}
                            </td>
                            <td className="align-middle">
                                {editingCompetitorId === competitor.id ? (
                                    <Form.Select
                                        as="select"
                                        value={editCompetitorData.gender}
                                        onChange={(e) => setEditCompetitorData({ ...editCompetitorData, gender_id: e.target.value })}
                                    >
                                        {genderOptions.map(option => (
                                            <option key={option.id} value={option.name} selected={option.name === competitor.gender}>
                                                {option.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                ) : (
                                    competitor.gender
                                )}
                            </td>
                            <td className="align-middle">
                                {editingCompetitorId === competitor.id ? (
                                    <Form.Control
                                        type="text"
                                        value={editCompetitorData.year_of_birth}
                                        onChange={(e) => setEditCompetitorData({ ...editCompetitorData, year_of_birth: e.target.value })}
                                    />
                                ) : (
                                    competitor.year_of_birth
                                )}
                            </td>
                            <td className="align-middle">
                                {editingCompetitorId === competitor.id ? (
                                    <Form.Select
                                        as="select"
                                        value={editCompetitorData.school}
                                        onChange={(e) => setEditCompetitorData({ ...editCompetitorData, school_id: e.target.value })}
                                    >
                                        {schoolOptions.map(option => (
                                            <option key={option.id} value={option.name} selected={option.name === competitor.school}>
                                                {option.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                ) : (
                                    competitor.school
                                )}
                            </td>
                            <td className="align-middle">
                                {editingCompetitorId === competitor.id ? (
                                    <>
                                        <Button variant="success" onClick={handleUpdateCompetitor}>
                                        <FontAwesomeIcon icon={faFloppyDisk} className="me-2" />

                                            დამახსოვრება</Button>
                                        <Button className="ms-2" variant="secondary" onClick={cancelEdit}>
                                        <FontAwesomeIcon icon={faBan} className="me-2" />

                                            გაუქმება</Button>
                                    </>
                                ) : (
                                    <Button variant="warning" onClick={() => startEdit(competitor)}>
                                        <FontAwesomeIcon icon={faPenToSquare}/>
                                    </Button>
                                )}
                                <Button className="ms-2" variant="danger" onClick={() => handleDeleteCompetitor(competitor.id)}>
                                    <FontAwesomeIcon icon={faTrashCan}/>
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Pagination>
                {Array.from({ length: Math.ceil(filteredCompetitors.length / competitorsPerPage) }, (_, index) => (
                    <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
                        {index + 1}
                    </Pagination.Item>
                ))}
            </Pagination>
        </div>

    );
};

export default Competitor;