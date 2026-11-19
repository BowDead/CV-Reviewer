export function positionSkillView(skill) {
  return {
    id: skill.id,
    name: skill.name,
    category: skill.category,
    isRequired: skill.isRequired,
  };
}

export function positionView(position) {
  return {
    id: position.id,
    title: position.title,
    description: position.description,
    url: position.url,
    isBlocked: position.isBlocked,
    skills: position.skills.map(positionSkillView),
    createdAt: position.createdAt,
    updatedAt: position.updatedAt,
  };
}

export function skillSuggestionView(suggestion) {
  return {
    skills: suggestion.skills.map(positionSkillView),
    unknownSkills: suggestion.unknownSkills,
  };
}
