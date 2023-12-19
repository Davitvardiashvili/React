import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
import axiosInstance from '../axiosInstance/axiosInstance';


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

        // Fetch school options
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
        }, {
            headers: {
                Authorization: localStorage.getItem('token')
            }
        })
        .then(response => {
            setCompetitors([...competitors, response.data]);
            setNewCompetitor({ name: '', surname: '', gender: '', year: '', school: '' });
        })
        .catch(error => {
            console.error('Error adding competitor:', error);
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
            gender: competitor.gender, // Ensure you use the correct field for gender ID
            year: competitor.year,
            school: competitor.school // Ensure you use the correct field for school ID
        });
    };
    
    const cancelEdit = () => {
        setEditingCompetitorId(null);
        setEditCompetitorData({ name: '', surname: '', gender: '', year: '', school: '' });
    };

    const handleUpdateCompetitor = (e) => {
        e.preventDefault();
    
        const updatedData = {
            name: editCompetitorData.name,
            surname: editCompetitorData.surname,
            year: editCompetitorData.year,
            gender_id: editCompetitorData.gender_id !== '' ? parseInt(editCompetitorData.gender_id, 10) : null,
            school_id: editCompetitorData.school_id !== '' ? parseInt(editCompetitorData.school_id, 10) : null
        };
    
        axiosInstance.put(`/competitor/${editingCompetitorId}/`, updatedData, {
            headers: {
                Authorization: localStorage.getItem('token')
            }
        })
        .then(response => {
            setCompetitors(competitors.map(competitor => 
                competitor.id === editingCompetitorId ? response.data : competitor
            ));
            cancelEdit();
        })
        .catch(error => {
            console.error('Error updating competitor:', error);
        });
    };

    const genderOptions = [
        { id: '1', name: 'Male' },
        { id: '2', name: 'Female' }
    ]; 


    const handleDeleteCompetitor = (competitorId) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this competitor?");
    
        if (isConfirmed) {
            axiosInstance.delete(`/competitor/${competitorId}/`, {
                headers: {
                    Authorization: localStorage.getItem('token')
                }
            })
            .then(() => {
                // Update the competitors state to remove the deleted competitor
                setCompetitors(competitors.filter(competitor => competitor.id !== competitorId));
            })
            .catch(error => {
                console.error('Error deleting competitor:', error);
            });
        }
    };

  return (
    <div className="homeTable">
        <form onSubmit={handleAddCompetitor}>
                <input
                    type="text"
                    name="name"
                    value={newCompetitor.name}
                    onChange={handleChange}
                    placeholder="Name"
                />
                <input
                    type="text"
                    name="surname"
                    value={newCompetitor.surname}
                    onChange={handleChange}
                    placeholder="Surname"
                />
                <select
                    name="gender"
                    value={newCompetitor.gender}
                    onChange={handleChange}
                >
                    <option value="">Select Gender</option>
                    <option value="1">Male</option>
                    <option value="2">Female</option>
                </select>
                <input
                    type="text"
                    name="year"
                    value={newCompetitor.year}
                    onChange={handleChange}
                    placeholder="Birth Year"
                />
                <select
                    name="school"
                    value={newCompetitor.school}
                    onChange={handleChange}
                >
                    <option value="">Select School</option>
                    {schoolOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.school_name}</option>
                    ))}
                </select>
                <button type="submit">Add Competitor</button>
            </form>
        <div className="tableHeader"><h4>Competitors</h4></div>
        <table>
            <tr>
                <th>id</th>
                <th>Name</th>
                <th>Surname</th>
                <th>Gender</th>
                <th>Birth Year</th>
                <th>School</th>
                <th>Edit</th>
                <th>Delete</th>
            </tr>
            {competitors.map(competitor => (
            <tr key={competitor.id}>
                <td>{competitor.id}</td>
                <td>
                    {editingCompetitorId === competitor.id ? (
                        <input 
                            type="text" 
                            value={editCompetitorData.name} 
                            onChange={(e) => setEditCompetitorData({...editCompetitorData, name: e.target.value})} 
                        />
                    ) : (
                        competitor.name
                    )}
                </td>
                <td>
                    {editingCompetitorId === competitor.id ? (
                        <input 
                            type="text" 
                            value={editCompetitorData.surname} 
                            onChange={(e) => setEditCompetitorData({...editCompetitorData, surname: e.target.value})} 
                        />
                    ) : (
                        competitor.surname
                    )}
                </td>
                <td>
                    {editingCompetitorId === competitor.id ? (
                        <select
                            value={editCompetitorData.gender_id || competitor.gender_id}
                            onLoad={(e) => setEditCompetitorData({...editCompetitorData, gender_id: e.target.value})}
                            onChange={(e) => setEditCompetitorData({...editCompetitorData, gender_id: e.target.value})}
                        >
                            {genderOptions.map(option => (
                                <option key={option.id} value={option.id} selected={option.name === (editCompetitorData.gender_id || competitor.gender)}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    ) : (
                        genderOptions.find(option => option.name === competitor.gender)?.name || 'N/A'
                    )}
                </td>
                <td>
                    {editingCompetitorId === competitor.id ? (
                        <input 
                            type="text" 
                            value={editCompetitorData.year} 
                            onChange={(e) => setEditCompetitorData({...editCompetitorData, year: e.target.value})} 
                        />
                    ) : (
                        competitor.year
                    )}
                </td>
                <td>
                    {editingCompetitorId === competitor.id ? (
                        <select
                            value={editCompetitorData.school_id || competitor.school}
                            option={schoolOptions.competitor}
                            onChange={(e) => setEditCompetitorData({...editCompetitorData, school_id: e.target.value})}
                        >
                            {/* Filter out the currently selected school from the options */}
                            {schoolOptions
                                .filter(option => option.id !== (editCompetitorData.school_id || competitor.school_id))
                                .map(option => (
                                    <option key={option.id} value={option.id}>{option.school_name}</option>
                                ))}
                        </select>
                    ) : (
                        competitor.school // Ensure this shows a meaningful representation of the school
                    )}
                </td>
                <td>
                    {editingCompetitorId === competitor.id ? (
                        <>
                            <button onClick={handleUpdateCompetitor}>save</button>
                            <button onClick={cancelEdit}>cancel</button>
                        </>
                    ) : (
                        <button onClick={() => startEdit(competitor)}>edit</button>
                    )}
                </td>
                <td>
                    <button onClick={() => handleDeleteCompetitor(competitor.id)}>delete</button>
                </td>
            </tr>
            ))}
        </table>
      </div>
    
  );
};

export default Competitor;