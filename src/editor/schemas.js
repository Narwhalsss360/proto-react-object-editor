const isDigit = character => '0' <= character && character <= '9'

const removeAt = (str, i) => str.slice(0, i) + str.slice(i + 1)

function validateName(name) {
  let modified = false;
  for (let i = 0; i < name.length(); i++) {
    if (isDigit(name[i])) {
      modified = true;
      name = removeAt(name, i)
    }
  }
  return modified ? name : null
}

function validateAge(age) {
  if (age <= 0) {
    return 0;
  }

  if (age >= 120) {
    return 120;
  }

  return null
}

const EXAMPLE_SCHEMA_PERSON = {
  'first': { label: 'First Name', types: ['string'], default: 'First', validator: validateName },
  'last': { label: 'Last Name', types: ['string'], default: 'Last', validator: validateName },
  'age': { label: 'Age', types: ['number'], validator: validateAge },
  'body': { label: 'Body', types: ['object'], required: false, children: {
    'height': { label: 'Height (cm)', types: ['number'], required: true },
    'weight': { label: 'Weight (kg)', types: ['number'], }
  } }
}
