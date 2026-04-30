import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);

  return (
    <div>
      <h1>{t('about.about_us')}</h1>
    </div>
  );
};

export default About;
