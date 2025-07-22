import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ImagePickerComponent from './ImagePickerComponent';

const CreateRecipeScreen = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [servings, setServings] = useState('');
  const [note, setNote] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [ingredients, setIngredients] = useState([{ name: '', amount: '' }]);
  const [steps, setSteps] = useState(['']);

  const validate = () => {
    if (!name || !category || !description || !calories || !cookingTime || servings < 1 || !imageUri) {
      alert('Please fill in all fields and add an image!');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (validate()) {
      const newRecipe = {
        id: Math.random().toString(),
        name,
        category,
        description,
        calories,
        cookingTime,
        servings,
        ingredients,
        steps,
        image: imageUri,
        note,
      };

      try {
        alert('Recipe submitted successfully!');
        console.log('Recipe submitted:', newRecipe);

        setName('');
        setCategory('');
        setDescription('');
        setCalories('');
        setCookingTime('');
        setServings('');
        setIngredients([{ name: '', amount: '' }]);
        setSteps(['']);
        setImageUri(null);
        setNote('');
      } catch (error) {
        alert('Error submitting recipe');
        console.error('Error:', error);
      }
    }
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      enableOnAndroid={true}
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Ionicons name="restaurant" size={40} color="#FDEBD0" />
        <Text style={styles.title}>Create New Dish</Text>
        <Text style={styles.subtitle}>BTN Restaurant</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dish Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter dish name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#4D5656"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Main Course, Dessert"
            value={category}
            onChangeText={setCategory}
            placeholderTextColor="#4D5656"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your dish"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholderTextColor="#4D5656"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Calories</Text>
            <TextInput
              style={styles.input}
              placeholder="kcal"
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              placeholderTextColor="#4D5656"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.label}>Cooking Time</Text>
            <TextInput
              style={styles.input}
              placeholder="30 mins"
              value={cookingTime}
              onChangeText={setCookingTime}
              placeholderTextColor="#4D5656"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Servings</Text>
          <TextInput
            style={styles.input}
            placeholder="Number of servings"
            value={servings}
            onChangeText={(text) => setServings(Number(text))}
            keyboardType="numeric"
            placeholderTextColor="#4D5656"
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientRow}>
              <TextInput
                style={[styles.input, { flex: 2, marginRight: 10 }]}
                placeholder="Ingredient name"
                value={ingredient.name}
                onChangeText={(text) => handleIngredientChange(index, 'name', text)}
                placeholderTextColor="#4D5656"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Amount"
                value={ingredient.amount}
                onChangeText={(text) => handleIngredientChange(index, 'amount', text)}
                placeholderTextColor="#4D5656"
              />
            </View>
          ))}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIngredients([...ingredients, { name: '', amount: '' }])}
          >
            <Ionicons name="add" size={20} color="#FDEBD0" />
            <Text style={styles.addButtonText}>Add Ingredient</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Cooking Steps</Text>
          {steps.map((step, index) => (
            <View key={index} style={styles.inputGroup}>
              <Text style={styles.stepLabel}>Step {index + 1}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={step}
                onChangeText={(text) => handleStepChange(index, text)}
                placeholder={`Describe step ${index + 1}`}
                multiline
                numberOfLines={3}
                placeholderTextColor="#4D5656"
              />
            </View>
          ))}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setSteps([...steps, ''])}
          >
            <Ionicons name="add" size={20} color="#FDEBD0" />
            <Text style={styles.addButtonText}>Add Step</Text>
          </TouchableOpacity>
        </View>

        <ImagePickerComponent
          setImageUri={setImageUri}
          setNote={setNote}
          imageUri={imageUri}
          note={note}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Ionicons name="checkmark" size={24} color="#FDEBD0" />
          <Text style={styles.submitButtonText}>Submit Dish</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FDEBD0',
  },
  header: {
    backgroundColor: '#E67E22',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FDEBD0',
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#FDEBD0',
    opacity: 0.9,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2C3E50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  ingredientRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E67E22',
    marginBottom: 5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A04000',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  addButtonText: {
    color: '#FDEBD0',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D35400',
    paddingVertical: 18,
    borderRadius: 15,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    color: '#FDEBD0',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default CreateRecipeScreen;