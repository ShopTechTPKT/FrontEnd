import React from 'react';
import './ProfileCard.css'; // Chỉ cần import, không cần 'styles'

import { FaLinkedin, FaDribbble, FaGithub } from 'react-icons/fa';

const ProfileCard = ({ memberData }) => {
  const { name, masterRole, location, image, socialLinks } = memberData;

  return (
    <div className="profileCard">
      <div className="cardBorder">
        <div className="cardPerfil">
          <img src={image} alt={`${name} profile`} className="cardImg" />
        </div>
      </div>

      <h3 className="cardName">{name}</h3>
      <span className="cardProfession">{"Full stack developers"}</span>
      <div className="infoData">
        <span className="infoProfession">{masterRole}</span>
        <span className="infoLocation">{location}</span>
      </div>

      <div className="infoSocial">
        <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="infoSocialLink">
          <span className="infoSocialIcon">
            <FaLinkedin />
          </span>
        </a>

        <a href={socialLinks.dribbble} target="_blank" rel="noreferrer" className="infoSocialLink">
          <span className="infoSocialIcon">
            <FaDribbble />
          </span>
        </a>

        <a href={socialLinks.github} target="_blank" rel="noreferrer" className="infoSocialLink">
          <span className="infoSocialIcon">
            <FaGithub />
          </span>
        </a>
      </div>
    </div>
  );
};

export default ProfileCard;

// Updated: 2025-10-12T16:06:22.300Z

// Updated: 2025-10-12T16:08:49.065Z
