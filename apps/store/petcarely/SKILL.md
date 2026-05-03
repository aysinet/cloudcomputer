# PetCarely — AI Skill

## Capability
Pet profile management: add, edit, delete pets with detailed attributes.

## Auth
JWT token required.

## API Endpoints

### GET /api/pets
Lists all pets.

### POST /api/pets
Adds a new pet.
- **Body**: `{ name, species, breed, gender, birth_date, color, weight, microchip_id, size, coat_type, eye_color, distinctive_marks, temperament, activity_level, training_level, good_with_kids, good_with_pets, good_with_strangers, neutered_spayed, allergies, chronic_conditions, profile_photo_url, additional_photos }`

### PUT /api/pets/:id
Updates a pet.

### DELETE /api/pets/:id
Deletes a pet.

## Storage
SQLite — `pets` table
