import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from '../axiosInstance/axiosInstance';



const Stages = () => {
    
    const [stages, setStages] = useState([]);
    const [newStage, setNewStage] = useState({
        discipline:'',
        name:'',
        period:''
    });
    const [editingStageId, setEditingStageId] = useState(null);
    const [editStageData, setEditStageData] = useState({
        discipline:'',
        season:'',
        period:''
    });

    const [disciplineOptions, setDisciplineOptions] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:8000/api/stage/`)
            .then((response) => {
              setStages(response.data);
            })
            .catch((error) => {
                console.error("Error fetching Stages data:", error);
            });

        axios.get(`http://localhost:8000/api/discipline/`)
            .then(response => {
              setDisciplineOptions(response.data);
              console.log(disciplineOptions);
            })
            .catch(error => {
                console.error("Error fetching seasons data:", error);
            });
    }, []);

    const handleAddStage = (e) => {
        e.preventDefault();
    
    
        axiosInstance.post('/stage/', { 
            ...newStage,
            discipline_id: parseInt(newStage.discipline,10)
        })
        .then(response => {
            setStages([...stages, response.data]);
            setNewStage({  discipline:'', name:'', period:''});
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
            discipline_id: stage.discipline.discipline,
            period:stage.period,
            // Ensure you use the correct field for school ID
        });
    };

    const cancelEdit = () => {
        setEditingStageId(null);
        setEditStageData({ name:'', discipline:'',  period:''});
    };


    const handleUpdateStage = (e) => {
        e.preventDefault();
    
        const disciplineId = disciplineOptions.find(discipline => discipline.discipline === editStageData.discipline_id)?.id
        const updatedData = {
            name: editStageData.name,
            period:editStageData.period,
            discipline_id: Number(disciplineId) || null,
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
                    name="discipline"
                    value={newStage.discipline}
                    onChange={handleChange}
                >
                    <option value="">Select Discipline</option>
                    {disciplineOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.season.season} - {option.discipline}</option>
                    ))}
                </select>
                <input
                    type="date"
                    name="period"
                    value={newStage.period}
                    onChange={handleChange}
                />
                <button type="submit">Add</button>
            </form>
            <div className="tableHeader"><h4>Stages</h4></div>
            <table>
                <thead>
                <tr>
                    <th>id</th>
                    <th>Stage Name</th>
                    <th>Season</th>
                    <th>Discipline</th>
                    <th>Period</th>
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
                        <td>{stage.discipline.season.season}</td>
                        <td>
                            {editingStageId === stage.id ? (
                                <select
                                    value={editStageData.discipline}
                                    onChange={(e) => setEditStageData({...editStageData, discipline_id: e.target.value})}
                                >
                                    {disciplineOptions.map(option => (
                                        <option key={option.id} value={option.discipline} selected={option.discipline === (stage.discipline.discipline)}>
                                            {option.season.season} - {option.discipline}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                stage.discipline.discipline // Ensure this shows a meaningful representation of the school
                            )}
                        </td>
                        <td>
                            {editingStageId === stage.id ? (
                                <input 
                                    type="date" 
                                    value={editStageData.period} 
                                    onChange={(e) => setEditStageData({...editStageData, period: e.target.value})} 
                                />
                            ) : (
                              stage.period
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
