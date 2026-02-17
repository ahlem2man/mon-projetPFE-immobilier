import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Vérification en cours...');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/verify-email/${token}`);
        setStatus(res.data.message);
      
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        setStatus(err.response?.data?.message || "Erreur de vérification");
      }
    };
    verify();
  }, [token, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Vérification de compte</h2>
      <p>{status}</p>
    </div>
  );
};

export default VerifyEmail;