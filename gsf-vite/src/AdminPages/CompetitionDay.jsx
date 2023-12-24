import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from '../axiosInstance/axiosInstance';



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
        axios.get(`http://localhost:8000/api/competition/`)
            .then((response) => {
                setCompetitions(response.data);
            })
            .catch((error) => {
                console.error("Error fetching discipline data:", error);
            });

        axios.get(`http://localhost:8000/api/stage/`)
            .then(response => {
                setStageOptions(response.data);
            })
            .catch(error => {
                console.error("Error fetching seasons data:", error);
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

    const handleAddCompetition = (e) => {
        e.preventDefault();
    
    
        axiosInstance.post('/competition/', { 
            ...newCompetition,
            stage_id: parseInt(newCompetition.stage,10),
            discipline_id: parseInt(newCompetition.discipline,10)
        })
        .then(response => {
            setCompetitions([...competitions, response.data]);
            setNewCompetition({ 
                stage:'',
                discipline:'',
                period:''
            });
        })
        .catch(error => {
            console.error('Error adding Competition:', error);
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
            discipline_id: competition.discipline.discipline, // Ensure you use the correct field for school ID
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


    const handleUpdateCompetition= (e) => {
        e.preventDefault();
    
        const stageId = stageOptions.find(stage => stage.name === editCompetitionData.stage_id)?.id
        const disciplineId = disciplineOptions.find(discipline => discipline.discipline === editCompetitionData.discipline_id)?.id
        const updatedData = {
            stage_id:Number(stageId) || null,
            discipline_id: Number(disciplineId) || null,
            period: editCompetitionData.period,

        };
        
        axiosInstance.put(`/competition/${editingCompetitionId}/`, updatedData,)
        .then(response => {
            setCompetitions(competitions.map(competition => 
                competition.id === editingCompetitionId ? response.data : competition
            ));
            cancelEdit();
        })
        .catch(error => {
            console.error('Error updating discipline:', error);
        });
    };


    const handleDeleteCompetition = (competitionId) => {
        const isConfirmed = window.confirm("Are you sure to delete this Competition?");
    
        if (isConfirmed) {
            
            axiosInstance.delete(`/competition/${competitionId}`)
            .then(() => {
                // Update the state to remove the deleted school
                setCompetitions(competitions.filter(competition => competition.id !== competitionId));
            })
            .catch(error => {
                console.error('Error deleting discipline:', error);
            });
        }
    };

    return (
        <div className="homeTable">
            <form onSubmit={handleAddCompetition}>
                <select
                    name="stage"
                    value={newCompetition.stage}
                    onChange={handleChange}
                >
                    <option value="">Select Stage</option>
                    {stageOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.season.season} - {option.name}</option>
                    ))}
                </select>
                <select
                    name="discipline"
                    value={newCompetition.discipline}
                    onChange={handleChange}
                >
                    <option value="">Select Discipline</option>
                    {disciplineOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.discipline}</option>
                    ))}
                </select>
                <input
                    type="date"
                    name="period"
                    value={newCompetition.period}
                    onChange={handleChange}
                />
                <button type="submit">Add</button>
            </form>
            <div className="tableHeader"><h4>Competitions</h4></div>
            <table>
                <thead>
                <tr>
                    <th>id</th>
                    <td>Season</td>
                    <td>Stage</td>
                    <th>Discipline</th>
                    <th>Period</th>
                    <th>Edit</th>
                    <th>Delete</th>
                </tr>
                </thead>
                <tbody>
                {competitions.map(competition => (
                    <tr key={competition.id}>
                        <td>{competition.id}</td>
                        <td>{competition.stage.season.season}</td>
                        <td>
                            {editingCompetitionId === competition.id ? (
                                <select
                                    value={editCompetitionData.stage}
                                    onChange={(e) => setEditCompetitionData({...editCompetitionData, stage_id: e.target.value})}
                                >
                                    {stageOptions.map(option => (
                                        <option key={option.id} value={option.id} selected={option.name === (competition.stage.name)}>
                                            {option.season.season} - {option.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                competition.stage.name // Ensure this shows a meaningful representation of the school
                            )}
                        </td>
                        

                        <td>
                            {editingCompetitionId === competition.id ? (
                                <select
                                    value={editCompetitionData.stage}
                                    onChange={(e) => setEditCompetitionData({...editCompetitionData, stage_id: e.target.value})}
                                >
                                    {stageOptions.map(option => (
                                        <option key={option.id} value={option.id} selected={option.name === (competition.stage.name)}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                competition.discipline.discipline // Ensure this shows a meaningful representation of the school
                            )}
                        </td>
                        <td>{competition.period}</td>




                        {/* <td>{discipline.season.season}</td> */}
                        <td>
                            {editingCompetitionId === competition.id ? (
                            <>
                                <button onClick={handleUpdateCompetition}>save</button>
                                <button onClick={cancelEdit}>cancel</button>
                            </>
                            ) : (
                                <button onClick={() => startEdit(competition)}>edit</button>
                            )}
                        </td>
                        <td><button onClick={() => handleDeleteCompetition(competition.id)}>delete</button></td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default CompetitionDay;
