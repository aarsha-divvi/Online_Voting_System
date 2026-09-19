import { useState } from "react";

import {
    getLanguage,
    setLanguage
} from "../i18n";

function LanguageSelector({
                              language,
                              onChange,
                              onLanguageChange
                          }) {
    const [currentLanguage, setCurrentLanguage] =
        useState(
            language || getLanguage()
        );

    const handleChange = (event) => {
        const newLanguage =
            event.target.value;

        setCurrentLanguage(
            newLanguage
        );

        setLanguage(
            newLanguage
        );

        if (onChange) {
            onChange(newLanguage);
        }

        if (onLanguageChange) {
            onLanguageChange(newLanguage);
        }
    };

    return (
        <div className="language-selector">

            <span className="language-icon">
                🌐
            </span>

            <select
                value={
                    language ||
                    currentLanguage
                }
                onChange={
                    handleChange
                }
                aria-label="Select language"
            >

                <option value="en">
                    English
                </option>

                <option value="hi">
                    हिन्दी
                </option>

                <option value="te">
                    తెలుగు
                </option>

            </select>

        </div>
    );
}

export default LanguageSelector;