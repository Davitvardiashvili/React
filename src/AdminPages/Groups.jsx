import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
import axiosInstance from '../axiosInstance/axiosInstance';
import { Button, Table, Form, Row, Col, Pagination } from 'react-bootstrap';
import { notifyError, notifySuccess } from '../App';
import { globalUrl } from "../App";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk, faPenToSquare, faPlus, faTrashCan, faBan } from '@fortawesome/free-solid-svg-icons';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [competitionOptions, setCompetitionOptions] = useState([]);
    const [newGroup, setNewGroup] = useState({
        competition: '',
        group_name: '',
        gender: ''
    });
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [editGroupData, setEditGroupData] = useState({
        competition: '',
        group_name: '',
        gender: ''
    });

    const genderOptions = [
        { id: '1', name: 'Male' },
        { id: '2', name: 'Female' }
    ];

    useEffect(() => {
        axios.get(`${globalUrl.url}/api/group/`)
            .then(response => {
                setGroups(response.data);
            })
            .catch(error => {
                console.error("Error fetching group data:", error);
            });

        axios.get(`${globalUrl.url}/api/competition/`)
            .then(response => {
                setCompetitionOptions(response.data);
            })
            .catch(error => {
                console.error("Error fetching school data:", error);
            });

    }, []);

    const [currentPage, setCurrentPage] = useState(1);
    const groupsPerPage = 12;

    const indexOfLastGroup = currentPage * groupsPerPage;
    const indexOfFirstGroup = indexOfLastGroup - groupsPerPage;
    const currentGroups = groups.slice(indexOfFirstGroup, indexOfLastGroup);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleAddGroup = (e) => {
        e.preventDefault();

        axiosInstance.post('/group/', {
            ...newGroup,
            gender_id: parseInt(newGroup.gender, 10),
            competition_id: parseInt(newGroup.competition, 10),
        })
            .then(response => {
                setGroups([...groups, response.data]);
                setNewGroup({ group_name: '', competition: '', gender: '' });
                notifySuccess("ჯგუფი წარმატებით დაემატა", "success");
            })
            .catch(error => {
                console.error('Error adding Group:', error);
                notifyError("დაფიქსირდა შეცდომა ჯგუფის დამატებისას", "error");
            });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewGroup(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const startEdit = (group) => {
        setEditingGroupId(group.id);
        setEditGroupData({
            group_name: group.group_name,
            gender_id: group.gender,
            competition_id: group.competition
        });
    };

    const cancelEdit = () => {
        setEditingGroupId(null);
        setEditGroupData({ group_name: '', competition: '', gender: '' });
    };

    const handleUpdateGroup = (e) => {
        e.preventDefault();

        const genderId = genderOptions.find(gender => gender.name === editGroupData.gender_id)?.id;
        const competitionId = competitionOptions.find(option => option.id === parseInt(editGroupData.competition_id, 10))?.id;

        const updatedData = {
            group_name: editGroupData.group_name,
            gender_id: Number(genderId) || null,
            competition_id: Number(competitionId) || null,
        };

        axiosInstance.put(`/group/${editingGroupId}/`, updatedData,)
            .then(response => {
                setGroups(groups.map(group =>
                    group.id === editingGroupId ? response.data : group
                ));
                cancelEdit();
                notifySuccess("ჯგუფი წარმატებით შეიცვალა", "success");
            })
            .catch(error => {
                console.error('Error updating group:', error);
                notifyError("დაფიქსირდა შეცდომა ჯგუფის შეცვლისას", "error");
            });
    };

    const handleDeleteGroup = (groupId) => {
        const isConfirmed = window.confirm("დარწმუნებული ხარ რომ გსურს ჯგუფის წაშლა?");

        if (isConfirmed) {
            axiosInstance.delete(`/group/${groupId}/`,)
                .then(() => {
                    setGroups(groups.filter(group => group.id !== groupId));
                    notifySuccess("ჯგუფი წაიშალა წარმატებით", "success");
                })
                .catch(error => {
                    console.error('Error deleting group:', error);
                    notifyError("დაფიქსირდა შეცდომა ჯგუფის წაშლისას", "error");
                });
        }
    };

    return (
        <div className="homeTable container">
            <h5>ჯგუფის დამატება</h5>
            <hr></hr>
            <Form onSubmit={handleAddGroup} className="mb-3">
                <Row>
                    <Col md={2}>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                name="group_name"
                                value={newGroup.group_name}
                                onChange={handleChange}
                                placeholder="ჯგუფის სახელი"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Select as="select" name="competition" value={newGroup.competition} onChange={handleChange}>
                                <option value="">აირჩიე შეჯიბრის დღე</option>
                                {competitionOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.stage.season.season} - {option.stage.name} - {option.discipline.discipline}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group>
                            <Form.Select as="select" name="gender" value={newGroup.gender} onChange={handleChange}>
                                <option value="" disabled>სქესი</option>
                                <option value="1">კაცი</option>
                                <option value="2">ქალი</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Button type="submit" variant="success">
                        <FontAwesomeIcon icon={faPlus} className="me-2" />   
                            დამატება</Button>
                    </Col>
                </Row>
            </Form>
            <hr className="mt-5"></hr>
            <div className="mb-4"><h4>ჯგუფები</h4></div>
            <Table striped hover>
                <thead>
                    <tr>
                        <th>ჯგუფი</th>
                        <th>სქესი</th>
                        <th>სეზონი</th>
                        <th>ეტაპი</th>
                        <th>დისციპლინა</th>
                        <th>მოქმედება</th>
                    </tr>
                </thead>
                <tbody>
                    {currentGroups.map(group => (
                        <tr key={group.id}>
                            <td className="align-middle">
                                {editingGroupId === group.id ? (
                                    <Form.Control
                                        type="text"
                                        value={editGroupData.group_name}
                                        onChange={(e) => setEditGroupData({ ...editGroupData, group_name: e.target.value })}
                                    />
                                ) : (
                                    group.group_name
                                )}
                            </td>
                            <td className="align-middle">
                                {editingGroupId === group.id ? (
                                    <Form.Select as="select"
                                        value={editGroupData.gender}
                                        onChange={(e) => setEditGroupData({ ...editGroupData, gender_id: e.target.value })}>
                                        {genderOptions.map(option => (
                                            <option key={option.id} value={option.name}>{option.name}</option>
                                        ))}
                                    </Form.Select>
                                ) : (
                                    group.gender
                                )}
                            </td>
                            <td className="align-middle">{group.competition.stage.season.season}</td>
                            <td className="align-middle">
                                {editingGroupId === group.id ? (
                                    <Form.Select as="select"
                                        value={editGroupData.competition}
                                        onChange={(e) => setEditGroupData({ ...editGroupData, competition_id: e.target.value })}>
                                        {competitionOptions.map(option => (
                                            <option key={option.id} value={option.id}>{option.stage.season.season} - {option.stage.name} - {option.discipline.discipline}</option>
                                        ))}
                                    </Form.Select>
                                ) : (
                                    group.competition.stage.name
                                )}
                            </td>
                            <td className="align-middle">{group.competition.discipline.discipline}</td>
                            <td className="align-middle">
                                {/* {editingGroupId === group.id ? (
                                    <>
                                        <Button variant="success" onClick={handleUpdateGroup}>დამახსოვრება</Button>
                                        <Button variant="secondary" onClick={cancelEdit} className="ms-2">გაუქმება</Button>
                                    </>
                                ) : (
                                    <Button variant="warning" onClick={() => startEdit(group)}>შეცვლა</Button>
                                )} */}
                                <Button variant="danger" onClick={() => handleDeleteGroup(group.id)} className="ms-2">
                                <FontAwesomeIcon icon={faTrashCan} className="me-2" />   
                                    წაშლა</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Pagination>
                {Array.from({ length: Math.ceil(groups.length / groupsPerPage) }, (_, index) => (
                    <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
                        {index + 1}
                    </Pagination.Item>
                ))}
            </Pagination>
        </div>
    );
};

export default Groups;
