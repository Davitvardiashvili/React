import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from '../axiosInstance/axiosInstance';



const Stages = () => {
    
    const [stages, setStages] = useState([]);
    const [newStage, setNewStage] = useState({
        season:'',
        name:''
    });
    const [editingStageId, setEditingStageId] = useState(null);
    const [editStageData, setEditStageData] = useState({
        season:'',
        name:''
    });

    const [seasonOptions, setSeasonsOptions] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:8000/api/stage/`)
            .then((response) => {
              setStages(response.data);
            })
            .catch((error) => {
                console.error("Error fetching Stages data:", error);
            });

        axios.get(`http://localhost:8000/api/season/`)
            .then(response => {
                setSeasonsOptions(response.data);
            })
            .catch(error => {
                console.error("Error fetching seasons data:", error);
            });
    }, []);

    const handleAddStage = (e) => {
        e.preventDefault();
    
    
        axiosInstance.post('/stage/', { 
            ...newStage,
            season_id: parseInt(newStage.season,10)
        })
        .then(response => {
            setStages([...stages, response.data]);
            setNewStage({  season:'', name:''});
        })
        .catch(error => {
            console.error('Error adding stage:', error);
        });
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewStage(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const startEdit = (stage) => {
        setEditingStageId(stage.id);
        setEditStageData({
            name: stage.name,
            season_id: stage.season.season,
            // Ensure you use the correct field for school ID
        });
    };

    const cancelEdit = () => {
        setEditingStageId(null);
        setEditStageData({ name:'', season:''});
    };


    const handleUpdateStage = (e) => {
        e.preventDefault();
    
        const seasonId = seasonOptions.find(season => season.season === editStageData.season_id)?.id
        const updatedData = {
            name: editStageData.name,
            season_id: Number(seasonId) || null,
        };
        
        axiosInstance.put(`/stage/${editingStageId}/`, updatedData,)
        .then(response => {
            setStages(stages.map(stage => 
              stage.id === editingStageId ? response.data : stage
            ));
            cancelEdit();
        })
        .catch(error => {
            console.error('Error updating stage:', error);
        });
    };


    const handleDeleteStage = (stageId) => {
        const isConfirmed = window.confirm("Are you sure to delete this Stage?");
    
        if (isConfirmed) {
            
            axiosInstance.delete(`/stage/${stageId}`)
            .then(() => {
                // Update the state to remove the deleted school
                setStages(stages.filter(stage => stage.id !== stageId));
            })
            .catch(error => {
                console.error('Error deleting stage:', error);
            });
        }
    };

    return (
        <div className="homeTable">
            <form onSubmit={handleAddStage}>
                <input
                    type="text"
                    name="name"
                    value={newStage.name}
                    onChange={handleChange}
                    placeholder="Enter Stage name"
                />
                 <select
                    name="season"
                    value={newStage.season}
                    onChange={handleChange}
                >
                    <option value="">Select Season</option>
                    {seasonOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.season}</option>
                    ))}
                </select>
                <button type="submit">Add</button>
            </form>
            <div className="tableHeader"><h4>Stages</h4></div>
            <table>
                <thead>
                <tr>
                    <th>id</th>
                    <th>Stage Name</th>
                    <th>Season</th>
                    <th>Edit</th>
                    <th>Delete</th>
                </tr>
                </thead>
                <tbody>
                {stages.map(stage => (
                    <tr key={stage.id}>
                        <td>{stage.id}</td>
                        <td>
                            {editingStageId === stage.id ? (
                                <input 
                                    type="text" 
                                    value={editStageData.name} 
                                    onChange={(e) => setEditStageData({...editStageData, name: e.target.value})} 
                                />
                            ) : (
                              stage.name
                            )}
                        </td>
                        <td>
                            {editingStageId === stage.id ? (
                                <select
                                    value={editStageData.season}
                                    onChange={(e) => setEditStageData({...editStageData, season_id: e.target.value})}
                                >
                                    {seasonOptions.map(option => (
                                        <option key={option.id} value={option.season} selected={option.season === (stage.season.season)}>
                                            {option.season}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                stage.season.season // Ensure this shows a meaningful representation of the school
                            )}
                        </td>
                        {/* <td>{discipline.season.season}</td> */}
                        <td>
                            {editingStageId === stage.id ? (
                            <>
                                <button onClick={handleUpdateStage}>save</button>
                                <button onClick={cancelEdit}>cancel</button>
                            </>
                            ) : (
                                <button onClick={() => startEdit(stage)}>edit</button>
                            )}
                        </td>
                        <td><button onClick={() => handleDeleteStage(stage.id)}>delete</button></td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Stages;
