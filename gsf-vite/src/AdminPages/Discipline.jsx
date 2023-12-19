import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from '../axiosInstance/axiosInstance';



const Discipline = () => {
    
    const [disciplines, setDisciplines] = useState([]);
    const [newDiscipline, setNewDiscipline] = useState({
        discipline:'',
        season:'',
    });
    const [editingDisciplineId, setEditingDisciplineId] = useState(null);
    const [editDisciplineData, setEditDisciplineData] = useState({
        discipline:'',
        season:'',
    });

    const [seasonOptions, setSeasonsOptions] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:8000/api/discipline/`)
            .then((response) => {
              setDisciplines(response.data);
            })
            .catch((error) => {
                console.error("Error fetching discipline data:", error);
            });

        axios.get(`http://localhost:8000/api/season/`)
            .then(response => {
                setSeasonsOptions(response.data);
            })
            .catch(error => {
                console.error("Error fetching seasons data:", error);
            });
    }, []);

    const handleAddDiscipline = (e) => {
        e.preventDefault();
    
    
        axiosInstance.post('/discipline/', { 
            ...newDiscipline,
            season_id: parseInt(newDiscipline.season,10)
        })
        .then(response => {
            setDisciplines([...disciplines, response.data]);
            setNewDiscipline({ discipline:'', season:'' });
        })
        .catch(error => {
            console.error('Error adding discipline:', error);
        });
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewDiscipline(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const startEdit = (discipline) => {
        setEditingDisciplineId(discipline.id);
        setEditDisciplineData({
            discipline: discipline.discipline,
            season_id: discipline.season.season, // Ensure you use the correct field for school ID
        });
    };

    const cancelEdit = () => {
        setEditingDisciplineId(null);
        setEditDisciplineData({ discipline: '', season: ''});
    };


    const handleUpdateDiscipline = (e) => {
        e.preventDefault();
    
        const seasonId = seasonOptions.find(season => season.season === editDisciplineData.season_id)?.id
        console.log(seasonId);
        const updatedData = {
            discipline: editDisciplineData.discipline,
            season_id: Number(seasonId) || null,
        };
        
        axiosInstance.put(`/discipline/${editingDisciplineId}/`, updatedData,)
        .then(response => {
            setDisciplines(disciplines.map(discipline => 
                discipline.id === editingDisciplineId ? response.data : discipline
            ));
            cancelEdit();
        })
        .catch(error => {
            console.error('Error updating discipline:', error);
        });
    };


    const handleDeleteDiscipline = (disciplineId) => {
        const isConfirmed = window.confirm("Are you sure to delete this Discipline?");
    
        if (isConfirmed) {
            
            axiosInstance.delete(`/discipline/${disciplineId}`)
            .then(() => {
                // Update the state to remove the deleted school
                setDisciplines(disciplines.filter(discipline => discipline.id !== disciplineId));
            })
            .catch(error => {
                console.error('Error deleting discipline:', error);
            });
        }
    };

    return (
        <div className="homeTable">
            <form onSubmit={handleAddDiscipline}>
                <input
                    type="text"
                    name="discipline"
                    value={newDiscipline.discipline}
                    onChange={handleChange}
                    placeholder="Enter Discipline name"
                />
                 <select
                    name="season"
                    value={newDiscipline.season}
                    onChange={handleChange}
                >
                    <option value="">Select season</option>
                    {seasonOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.season}</option>
                    ))}
                </select>
                <button type="submit">Add</button>
            </form>
            <div className="tableHeader"><h4>Disciplines</h4></div>
            <table>
                <thead>
                <tr>
                    <th>id</th>
                    <th>Discipline</th>
                    <th>Season</th>
                    <th>Edit</th>
                    <th>Delete</th>
                </tr>
                </thead>
                <tbody>
                {disciplines.map(discipline => (
                    <tr key={discipline.id}>
                        <td>{discipline.id}</td>
                        <td>
                            {editingDisciplineId === discipline.id ? (
                                <input 
                                    type="text" 
                                    value={editDisciplineData.discipline} 
                                    onChange={(e) => setEditDisciplineData({...editDisciplineData, discipline: e.target.value})} 
                                />
                            ) : (
                                discipline.discipline
                            )}
                        </td>
                        <td>
                            {editingDisciplineId === discipline.id ? (
                                <select
                                    value={editDisciplineData.season}
                                    onChange={(e) => setEditDisciplineData({...editDisciplineData, season_id: e.target.value})}
                                >
                                    {seasonOptions.map(option => (
                                        <option key={option.id} value={option.season} selected={option.season === (discipline.season.season)}>
                                            {option.season}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                discipline.season.season // Ensure this shows a meaningful representation of the school
                            )}
                        </td>
                        {/* <td>{discipline.season.season}</td> */}
                        <td>
                            {editingDisciplineId === discipline.id ? (
                            <>
                                <button onClick={handleUpdateDiscipline}>save</button>
                                <button onClick={cancelEdit}>cancel</button>
                            </>
                            ) : (
                                <button onClick={() => startEdit(discipline)}>edit</button>
                            )}
                        </td>
                        <td><button onClick={() => handleDeleteDiscipline(discipline.id)}>delete</button></td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Discipline;
