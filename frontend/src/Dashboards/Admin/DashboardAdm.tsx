
import { Line, Doughnut, Pie, Bar} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions
} from 'chart.js';
import NavBar from '../../components/NavBar';
import { useEffect, useState } from 'react';
import { type Intervention, type Demande } from '../../types/interfaces';
import '../../styles/Dashboard.css';
import { useActiveLink } from '../../context/activeLinkContext';
import { useProfile } from '../../context/ProfileContext';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';



ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale,LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, Filler);


export default function DashboardAdm() {
    const[requestsData, setRequestsData] = useState<Demande[]>([]);
    const[interventionsData, setInterventionsData] = useState<Intervention[]>([]);

    const {profile} = useProfile();
    const {updateActiveLink} = useActiveLink();

    const navigate = useNavigate();

    const months = ['January', 'February', 'March', 'April', 'Mai', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    
    //the distribution of requests by their status:
    const requestStatusData = {
        labels: ['Pending', 'In Progress', 'Done'],
        datasets: [
        {
            label: '',
            data: [
                requestsData.filter(r => r.statusDemande.toLowerCase() === 'pending').length,
                requestsData.filter(r => r.statusDemande.toLowerCase() === 'in progress').length,
                requestsData.filter(r => r.statusDemande.toLowerCase() === 'done').length
            ],
            backgroundColor: [
                '#fada59ff',
                '#5283ffff',
                '#38ff98ff'
            ],
            borderWidth : 1,
        }
        ]
    };



    //the distribution of the interventions by their status:
    const interventionsStatusData = {
        labels: ['Pending', 'Completed'],
        datasets: [
        {
            label: '',
            data: [
                interventionsData.filter(r => r.statusIntervention.toLowerCase() === 'pending').length,
                interventionsData.filter(r => r.statusIntervention.toLowerCase() === 'completed').length,
            ],
            backgroundColor: [
                '#fada59ff',
                '#38ff98ff'
            ],
            borderWidth : 1,
        }
        ]
    }



    
    //calculating the number of interventions during the current year
    const interventionsNumber = [];
    for (let m = 0; m < months.length ; m++) {
        let ct = 0;
        interventionsData.map(i => {
        if(new Date(i.dateIntervention).getFullYear() === new Date().getFullYear() && 
            new Date(i.dateIntervention).getMonth() === m)
            ct++;
        });
        interventionsNumber.push(ct);
    }




    //the total number of interventions during the current year distributed by months:
    const interventionsNumberData = {
        labels: months,
        datasets: [
        {
            label: 'number of interventions',
            data: interventionsNumber,
            backgroundColor: [
                "#911924"
            ],
            borderRadius : 5,
            
        }
        ]
    };




    //calculating the number of requests during the current year
    const requestsNumber = [];
    for (let m = 0; m <= new Date().getMonth() ; m++) {
        let ct = 0;
        requestsData.map(i => {
        if(new Date(i.dateDemande).getFullYear() === new Date().getFullYear() && 
            new Date(i.dateDemande).getMonth() === m)
            ct++;
        });
        requestsNumber.push(ct);
    }

    //the total number of the requests during the current year distributed by months
    const requestNumberData = {
        labels: months.filter(m => months.indexOf(m) <= new Date().getMonth()),
        datasets: [
        {
            label: 'number of requests',
            data: requestsNumber,
            backgroundColor: [
                "#911924"
            ],
            borderColor : [
                "#911924"
            ],
            
            tension : 0.2
        }
        ]
    } 


    //options for the doughnut chart
    const doughnutOptions : ChartOptions<'doughnut'> = {
        responsive: true,
        plugins: {
        legend: {
            display: true,
            position: 'bottom',
        },
        title: {
            display: true,
            text: 'All requests status',
            font: {
            size: 18
            }
        }
        }
    };


    //options for the pie chart
    const pieOptions : ChartOptions<'pie'> = {
        responsive: true,
        plugins: {
        legend: {
            display: true,
            position: 'bottom',
        },
        title: {
            display: true,
            text: 'All interventions status',
            font: {
            size: 18
            }
        }
        }
    };



    //options for the bar chart
    const barOptions : ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
        legend: {
            display: true,
            position: 'bottom',
        },
        title: {
            display: true,
            text: 'Number of interventions over the year',
            font: {
            size: 18
            }
        }
        },
        scales : {
            y : {
                ticks : {
                    precision : 0
                }
            }
        }
    };



    //options for the line chart
    const lineOptions : ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
        legend: {
            display: true,
            position: 'bottom',
        },
        title: {
            display: true,
            text: 'Number of requests over the year',
            font: {
            size: 18
            }
        }
        },
        scales : {
            y : {
                ticks : {
                    precision : 0
                }
            }
        }
    };




    //recovering all the requests:
    const fetchAllRequests = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch("http://localhost:3000/get/demandes", {
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : token!
                }
            });

            const data = await response.json();

            setRequestsData(data.demandesData);
        }catch(e) {
            console.error('problem fetching requests data');
        }
    }



    
    //recovering all the interventions:
    const fetchAllInterventions= async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch("http://localhost:3000/get/interventions", {
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : token!
                }
            });

            const data = await response.json();

            setInterventionsData(data.interventionsData);
        }catch(e) {
            console.error('problem fetching interventions data');
        }
    }


    

    useEffect(() => {
        updateActiveLink('/Dashboard/Admin');
        fetchAllRequests();
        fetchAllInterventions();
    }, []);



    useEffect(() => {
        const token = localStorage.getItem('token');
        if(!token && !(profile?.firstLogin)) {
            navigate('/');
        }
    },[]);



    useEffect(() => {
        const token = localStorage.getItem("token");

        if(token){
            const decodedJwt = jwtDecode(token);
            const expiredTime = decodedJwt.exp! * 1000;
            const timeLeft = expiredTime - Date.now();

            if(timeLeft <= 0){
                toast.error("Session Expired, Please Login Again");
                navigate('/');
            }else {
                const timer = setTimeout(() => {
                    toast.error("Session Expired, Please Login Again");
                    navigate('/');
                }, timeLeft);

                return () => clearInterval(timer);
            }
        }
    }, []);


    return (
    <>
        <NavBar />
        <div className="dashboard-admin-page" >
            <div className="dashboard-admin-header-container">
                <h1 className="dashboard-admin-header">
                    Dashboard
                </h1>
                <p className="dashboard-admin-subheader">
                    Discover stats about: requests status, number of interventions, number of requests...
                </p>
            </div>
            <div className="charts-admin-grid">

                <div className="chart-card chart-card-wide">
                    <div className="chart-header">
                        <h3 className="chart-title">Requests Over Time In {new Date().getFullYear()}</h3>
                    </div>
                    <div className="chart-container">
                        <Line options={lineOptions} data={requestNumberData} />
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title">Request By Status</h3>
                    </div>
                    <div className="chart-container">
                        <Doughnut options={doughnutOptions} data={requestStatusData} />
                    </div>
                </div>

        
                <div className="chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title">Interventions By Status</h3>
                    </div>
                    <div className="chart-container">
                        <Pie options={pieOptions} data={interventionsStatusData} />
                    </div>
                </div>

        
                <div className="chart-card chart-card-wide">
                    <div className="chart-header">
                        <h3 className="chart-title">Interventions Over Time In {new Date().getFullYear()}</h3>
                    </div>
                    <div className="chart-container">
                        <Bar options={barOptions} data={interventionsNumberData} />
                    </div>
                </div>
            </div> 
        </div>
        <Footer />
    </> 
    
  );
};

