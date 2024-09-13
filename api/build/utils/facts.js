export const configureFactItems = (facts) => {
    return facts.map((fact) => ({
        id: fact._id.toString(),
        title: fact.title,
        details: fact.details,
        category: fact.category,
        source: fact.source,
    }));
};
