import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from '../axiosInstance/axiosInstance';


const School = () => {
    
    const [schools, setSchools] = useState([]);
    const [newSchoolName, setNewSchoolName] = useState('');
    const [editingSchoolId, setEditingSchoolId] = useState(null);
    const [editSchoolName, setEditSchoolName] = useState('');

    useEffect(() => {
        axiosInstance.get(`/school/`)
            .then((response) => {
                setSchools(response.data);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }, []);

    const handleAddSchool = (e) => {
        e.preventDefault();
    
        const token = localStorage.getItem('token');
    
        axiosInstance.post('/school/', { school_name: newSchoolName }, {
            headers: {
                Authorization: `${token}`
            }
        })
        .then(response => {
            setSchools([...schools, response.data]);
            setNewSchoolName('');
        })
        .catch(error => {
            console.error('Error adding school:', error);
        });
    };


    const handleDeleteSchool = (schoolId) => {
        const isConfirmed = window.confirm("Are you sure to delete this school?");
    
        if (isConfirmed) {
            const token = localStorage.getItem('token');
            axiosInstance.delete(`/school/${schoolId}`, {
                headers: {
                    Authorization: `${token}`
                }
            })
            .then(() => {
                // Update the state to remove the deleted school
                setSchools(schools.filter(school => school.id !== schoolId));
            })
            .catch(error => {
                console.error('Error deleting school:', error);
            });
        }
    };

    const startEdit = (school) => {
        setEditingSchoolId(school.id);
        setEditSchoolName(school.school_name);
    };
    
    const cancelEdit = () => {
        setEditingSchoolId(null);
        setEditSchoolName('');
    };


    const handleUpdateSchool = (e, schoolId) => {
        e.preventDefault();
    
        const token = localStorage.getItem('token');
        
        axiosInstance.put(`/school/${schoolId}/`, { school_name: editSchoolName }, {
            headers: {
                Authorization: `${token}`
            }
        })
        .then(response => {
            setSchools(schools.map(school => school.id === schoolId ? response.data : school));
            cancelEdit();
        })
        .catch(error => {
            console.error('Error updating school:', error);
        });
    };


    return (
        <div className="homeTable">
            <form onSubmit={handleAddSchool}>
                <input
                    type="text"
                    value={newSchoolName}
                    onChange={(e) => setNewSchoolName(e.target.value)}
                    placeholder="Enter school name"
                />
                <button type="submit">Add</button>
            </form>
            <div className="tableHeader"><h4>Schools</h4></div>
            <table>
                <tr>
                    <th>id</th>
                    <th>School</th>
                    <th>Created</th>
                    <th>Edit</th>
                    <th>Delete</th>
                </tr>
                {schools.map(school => (
                    <tr key={school.id}>
                        <td>{school.id}</td>
                        <td>
                            {editingSchoolId === school.id ? (
                                <input 
                                    type="text" 
                                    value={editSchoolName} 
                                    onChange={(e) => setEditSchoolName(e.target.value)} 
                                />
                            ) : (
                                school.school_name
                            )}
                        </td>
                        <td>{school.created}</td>
                        <td>
                            {editingSchoolId === school.id ? (
                                <button onClick={(e) => handleUpdateSchool(e, school.id)}>save</button>
                            ) : (
                                <button onClick={() => startEdit(school)}>edit</button>
                            )}
                        </td>
                        <td><button onClick={() => handleDeleteSchool(school.id)}>delete</button></td>
                    </tr>
                ))}
            </table>
        </div>
    );
};

export default School;
