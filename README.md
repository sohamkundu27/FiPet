# FiPet

## Starting the Frontend

1. Move to FiPetFrontend.

    ```bash
    cd FiPetFrontend
    ```

2. Install dependencies

   ```bash
   yarn add expo
   npx expo install
   ```

3. Start the app (locally)

   ```bash
   npx expo prebuild --clean
   npx expo run:android # (or run:ios)
   ```

4. Start the app (Expo Application Services)

   ```bash
   npm install -g eas-cli && eas login
   eas build --platform android --profile development
   npx expo run:android # (or run:ios)
   ```
   (Contact a Developer for eas login credentials)

5. If the instance stops, you can restart it with:

    ```bash
    npx expo start
    ```





