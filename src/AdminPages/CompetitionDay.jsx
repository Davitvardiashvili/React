import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from '../axiosInstance/axiosInstance';
import { Button, Table, Form, Row, Col, Pagination } from 'react-bootstrap';
import { notifyError, notifySuccess } from '../App';
import { globalUrl } from "../App";

const CompetitionDay = () => {

    const [competitions, setCompetitions] = useState([]);
    const [newCompetition, setNewCompetition] = useState({
        stage:'',
        discipline:'',
        period:''
    });
    const [editingCompetitionId, setEditingCompetitionId] = useState(null);
    const [editCompetitionData, setEditCompetitionData] = useState({
        stage:'',
        discipline:'',
        period:''
    });

    const [stageOptions, setStageOptions] = useState([]);
    const [disciplineOptions, setDisciplineOptions] = useState([]);

    useEffect(() => {
        axios.get(`${globalUrl.url}/api/competition/`)
            .then((response) => {
                setCompetitions(response.data);
            })
            .catch((error) => {
                console.error("Error fetching competition data:", error);
            });

        axios.get(`${globalUrl.url}/api/stage/`)
            .then(response => {
                setStageOptions(response.data);
            })
            .catch(error => {
                console.error("Error fetching stages data:", error);
            });

        axios.get(`${globalUrl.url}/api/discipline/`)
            .then(response => {
                setDisciplineOptions(response.data);
            })
            .catch(error => {
                console.error("Error fetching disciplines data:", error);
            });
    }, []);

    const [currentPage, setCurrentPage] = useState(1);
    const competitionsPerPage = 10;

    const indexOfLastCompetition = currentPage * competitionsPerPage;
    const indexOfFirstCompetition = indexOfLastCompetition - competitionsPerPage;
    const currentCompetitions = competitions.slice(indexOfFirstCompetition, indexOfLastCompetition);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleAddCompetition = (e) => {
        e.preventDefault();

        axiosInstance.post('/competition/', { 
            ...newCompetition,
            stage_id: parseInt(newCompetition.stage, 10),
            discipline_id: parseInt(newCompetition.discipline, 10)
        })
        .then(response => {
            setCompetitions([...competitions, response.data]);
            setNewCompetition({ 
                stage:'',
                discipline:'',
                period:''
            });
            notifySuccess("შეჯიბრი წარმატებით დაემატა", "success");
        })
        .catch(error => {
            console.error('Error adding Competition:', error);
            notifyError("დაფიქსირდა შეცდომა შეჯიბრის შექმნისას", "error");
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewCompetition(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const startEdit = (competition) => {
        setEditingCompetitionId(competition.id);
        setEditCompetitionData({
            stage_id: competition.stage.name,
            discipline_id: competition.discipline.discipline,
            period: competition.period
        });
    };

    const cancelEdit = () => {
        setEditingCompetitionId(null);
        setEditCompetitionData({ 
            stage:'',
            discipline:'',
            period:''
        });
    };

    const handleUpdateCompetition = (e) => {
        e.preventDefault();

        const stageId = stageOptions.find(stage => stage.name === editCompetitionData.stage_id)?.id
        const disciplineId = disciplineOptions.find(discipline => discipline.discipline === editCompetitionData.discipline_id)?.id
        const updatedData = {
            stage_id: Number(stageId) || null,
            discipline_id: Number(disciplineId) || null,
            period: editCompetitionData.period,
        };

        axiosInstance.put(`/competition/${editingCompetitionId}/`, updatedData,)
        .then(response => {
            setCompetitions(competitions.map(competition => 
                competition.id === editingCompetitionId ? response.data : competition
            ));
            cancelEdit();
            notifySuccess("შეჯიბრი წარმატებით შეიცვალა", "success");
        })
        .catch(error => {
            console.error('Error updating competition:', error);
            notifyError("დაფიქსირდა შეცდომა შეჯიბრის შეცვლისას", "error");
        });
    };

    const handleDeleteCompetition = (competitionId) => {
        const isConfirmed = window.confirm("Are you sure to delete this Competition?");

        if (isConfirmed) {
            axiosInstance.delete(`/competition/${competitionId}`)
            .then(() => {
                setCompetitions(competitions.filter(competition => competition.id !== competitionId));
                notifySuccess("შეჯიბრი წაიშალა წარმატებით", "success");
            })
            .catch(error => {
                console.error('Error deleting competition:', error);
                notifyError("დაფიქსირდა შეცდომა შეჯიბრის წაშლისას", "error");
            });
        }
    };

    return (
        <div className="homeTable container">
            <h5>შექმენი შეჯიბრის დღე</h5>
            <hr></hr>
            <Form onSubmit={handleAddCompetition} className="mb-4">
                <Row>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Control as="select" name="stage" value={newCompetition.stage} onChange={handleChange}>
                                <option value="" disabled>აირჩიე ეტაპი</option>
                                {stageOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.season.season} - {option.name}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Control as="select" name="discipline" value={newCompetition.discipline} onChange={handleChange}>
                                <option value="" disabled>დისციპლინა</option>
                                {disciplineOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.discipline}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group>
                            <Form.Control type="date" name="period" value={newCompetition.period} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Button type="submit" variant="primary">დამატება</Button>
                    </Col>
                </Row>
            </Form>
            <hr className="mt-5"></hr>
            <div className="mb-4"><h4>შეჯიბრებები</h4></div>
            <Table striped hover>
                <thead>
                    <tr>
                        <th>სეზონი</th>
                        <th>ეტაპი</th>
                        <th>დისციპლინა</th>
                        <th>თარიღი</th>
                        <th>მოქმედება</th>
                    </tr>
                </thead>
                <tbody>
                    {currentCompetitions.map(competition => (
                        <tr key={competition.id}>
                            <td className="align-middle">{competition.stage.season.season}</td>
                            <td className="align-middle">
                                {editingCompetitionId === competition.id ? (
                                    <Form.Control as="select"
                                        value={editCompetitionData.stage_id}
                                        onChange={(e) => setEditCompetitionData({...editCompetitionData, stage_id: e.target.value})}
                                    >
                                        {stageOptions.map(option => (
                                            <option key={option.id} value={option.name} selected={option.name === (competition.stage.name)}>
                                                {option.season.season} - {option.name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                ) : (
                                    competition.stage.name
                                )}
                            </td>
                            <td className="align-middle">
                                {editingCompetitionId === competition.id ? (
                                    <Form.Control as="select"
                                        value={editCompetitionData.discipline_id}
                                        onChange={(e) => setEditCompetitionData({...editCompetitionData, discipline_id: e.target.value})}
                                    >
                                        {disciplineOptions.map(option => (
                                            <option key={option.id} value={option.discipline} selected={option.discipline === (competition.discipline.discipline)}>
                                                {option.discipline}
                                            </option>
                                        ))}
                                    </Form.Control>
                                ) : (
                                    competition.discipline.discipline
                                )}
                            </td>
                            <td className="align-middle">{competition.period}</td>
                            <td className="align-middle">
                                {editingCompetitionId === competition.id ? (
                                    <>
                                        <Button variant="success" onClick={handleUpdateCompetition}>დამახსოვრება</Button>
                                        <Button variant="secondary" className="ms-2" onClick={cancelEdit}>გაუქმება</Button>
                                    </>
                                ) : (
                                    <Button variant="warning" onClick={() => startEdit(competition)}>შეცვლა</Button>
                                )}
                                <Button className="ms-2" variant="danger" onClick={() => handleDeleteCompetition(competition.id)}>წაშლა</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Pagination>
                {Array.from({ length: Math.ceil(competitions.length / competitionsPerPage) }, (_, index) => (
                    <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
                        {index + 1}
                    </Pagination.Item>
                ))}
            </Pagination>
        </div>
    );
};

export default CompetitionDay;
