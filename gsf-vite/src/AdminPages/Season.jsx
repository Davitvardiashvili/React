import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from '../axiosInstance/axiosInstance';



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
        })
        .catch(error => {
            console.error('Error adding season:', error);
        });
    };


    const handleDeleteSeason = (seasonId) => {
        const isConfirmed = window.confirm("Are you sure to delete this Season?");
    
        if (isConfirmed) {
            
            axiosInstance.delete(`/season/${seasonId}`)
            .then(() => {
                // Update the state to remove the deleted school
                setSeasons(seasons.filter(season => season.id !== seasonId));
            })
            .catch(error => {
                console.error('Error deleting Season:', error);
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
        })
        .catch(error => {
            console.error('Error updating season:', error);
        });
    };


    return (
        <div className="homeTable">
            <form onSubmit={handleAddSeason}>
                <input
                    type="text"
                    value={newSeasonName}
                    onChange={(e) => setNewSeasonName(e.target.value)}
                    placeholder="Enter Season name"
                />
                <button type="submit">Add</button>
            </form>
            <div className="tableHeader"><h4>Seasons</h4></div>
            <table>
                <thead>
                <tr>
                    <th>id</th>
                    <th>Season</th>
                    <th>Created</th>
                    <th>Edit</th>
                    <th>Delete</th>
                </tr>
                </thead>
                <tbody>
                {seasons.map(season => (
                    <tr key={season.id}>
                        <td>{season.id}</td>
                        <td>
                            {editingSeasonId === season.id ? (
                                <input 
                                    type="text" 
                                    value={editSeasonName} 
                                    onChange={(e) => setEditSeasonName(e.target.value)} 
                                />
                            ) : (
                                season.season
                            )}
                        </td>
                        <td>{season.created}</td>
                        <td>
                            {editingSeasonId === season.id ? (
                                <button onClick={(e) => handleUpdateSeason(e, season.id)}>save</button>
                            ) : (
                                <button onClick={() => startEdit(season)}>edit</button>
                            )}
                        </td>
                        <td><button onClick={() => handleDeleteSeason(season.id)}>delete</button></td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Season;
