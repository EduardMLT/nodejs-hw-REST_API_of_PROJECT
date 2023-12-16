const MacroCalculator = () => {
  const [goal, setGoal] = useState("weight_loss"); // Початкова ціль (схуднути)
  const [calories, setCalories] = useState(2000); // Загальна кількість калорій

  const calculateMacros = () => {
    let proteinPercentage, fatPercentage, carbPercentage;

    switch (goal) {
      case "weight_loss":
        proteinPercentage = 0.25;
        fatPercentage = 0.2;
        break;
      case "muscle_gain":
        proteinPercentage = 0.3;
        fatPercentage = 0.2;
        break;
      case "weight_maintenance":
        proteinPercentage = 0.2;
        fatPercentage = 0.25;
        break;
      default:
        proteinPercentage = 0.25;
        fatPercentage = 0.2;
    }

    carbPercentage = 1 - (proteinPercentage + fatPercentage);

    const protein = Math.round((proteinPercentage * calories) / 4);
    const fat = Math.round((fatPercentage * calories) / 9);
    const carbs = Math.round((carbPercentage * calories) / 4);

    return { protein, fat, carbs };
  };

  const handleGoalChange = (event) => {
    setGoal(event.target.value);
  };

  const handleCaloriesChange = (event) => {
    setCalories(parseInt(event.target.value));
  };

  const macros = calculateMacros();

  return (
    <div>
      <h2>Macro Calculator</h2>
      <label>
        Select your goal:
        <select value={goal} onChange={handleGoalChange}>
          <option value="weight_loss">Weight Loss</option>
          <option value="muscle_gain">Muscle Gain</option>
          <option value="weight_maintenance">Weight Maintenance</option>
        </select>
      </label>
      <br />
      <label>
        Total daily calories:
        <input type="number" value={calories} onChange={handleCaloriesChange} />
      </label>
      <br />
      <h3>Recommended Macros:</h3>
      <p>Protein: {macros.protein} grams</p>
      <p>Fat: {macros.fat} grams</p>
      <p>Carbohydrates: {macros.carbs} grams</p>
    </div>
  );
};

export default MacroCalculator;
