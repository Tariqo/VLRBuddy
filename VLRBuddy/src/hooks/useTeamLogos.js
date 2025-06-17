import { useEffect, useState } from 'react';
import axios from 'axios';

const useTeamLogos = () => {
  const [teamLogos, setTeamLogos] = useState({});
  const [loadingTeamLogos, setLoadingTeamLogos] = useState(true);
  const [errorTeamLogos, setErrorTeamLogos] = useState(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await axios.get('https://vlr.orlandomm.net/api/v1/teams?limit=all');
        const logosMap = {};
        response.data.data.forEach(team => {
          if (team.name && team.img) {
            logosMap[team.name] = team.img;
          }
        });
        setTeamLogos(logosMap);
      } catch (err) {
        setErrorTeamLogos('Failed to fetch team logos. Please ensure you have internet connection.');
        console.error('Error fetching team logos:', err);
      } finally {
        setLoadingTeamLogos(false);
      }
    };

    fetchTeamData();
  }, []);

  return { teamLogos, loadingTeamLogos, errorTeamLogos };
};

export default useTeamLogos; 