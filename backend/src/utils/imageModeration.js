const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const AppError = require('./appError');

// Define thresholds (can also be configured via environment variables)
const thresholds = {
  // Nudity thresholds
  nudity: 0.5,
  erotic: 0.8,
  sexual_display: 0.85,
  suggestive: 0.9,

  // Violence thresholds
  violence: 0.5,
  gore: 0.5,
  selfHarm: 0.5,

  // Weapon thresholds
  weapon: 0.5,
  firearm: 0.3,
  knife: 0.5,

  // Substance thresholds
  alcohol: 0.7,
  drugs: 0.5,

  // Offensive content
  offensive: 0.7,
  hate_symbol: 0.6,

  // Context thresholds
  inappropriate_context: 0.8,
};

const checkImageContent = async (imagePath) => {
  try {
    // Create form data for Sightengine API
    const data = new FormData();
    data.append('media', fs.createReadStream(imagePath));
    data.append(
      'models',
      'nudity-2.1,weapon,offensive-2.0,gore-2.0,violence,self-harm,alcohol,recreational_drug'
    );
    data.append('api_user', process.env.SIGHTENGINE_USER);
    data.append('api_secret', process.env.SIGHTENGINE_SECRET);

    // Get headers asynchronously
    const headers = await new Promise((resolve, reject) => {
      data.getLength((err, length) => {
        if (err) reject(err);
        resolve({
          ...data.getHeaders(),
          'Content-Length': length,
        });
      });
    });

    // Make API request to Sightengine
    const response = await axios({
      method: 'post',
      url: 'https://api.sightengine.com/1.0/check.json',
      data: data,
      headers: headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const result = response.data;
    console.log('Sightengine result:', result);

    // Perform all content checks
    performContentChecks(result);

    return result;
  } catch (error) {
    console.error('Image moderation error:', error);
    if (error instanceof AppError) throw error;
    if (error.response) {
      throw new AppError('Image verification failed', 400);
    }
    throw new AppError('Failed to process image', 500);
  }
};

const performContentChecks = (result) => {
  // 1. NUDITY & SUGGESTIVE CONTENT CHECK
  const nudity = result.nudity || {};
  if (
    nudity.sexual_activity > thresholds.nudity ||
    nudity.sexual_display > thresholds.sexual_display ||
    nudity.erotica > thresholds.erotic ||
    nudity.very_suggestive > thresholds.suggestive ||
    nudity.suggestive > thresholds.suggestive ||
    (nudity.suggestive_classes &&
      (nudity.suggestive_classes.lingerie > thresholds.suggestive ||
        nudity.suggestive_classes.bikini > thresholds.suggestive ||
        nudity.suggestive_classes.cleavage > thresholds.suggestive ||
        nudity.suggestive_classes.suggestive_pose > thresholds.suggestive ||
        nudity.suggestive_classes.sextoy > thresholds.suggestive))
  ) {
    throw new AppError(
      'Image contains inappropriate nudity or suggestive content.',
      400
    );
  }

  // 2. VIOLENCE CHECK
  const violence = result.violence || {};
  if (
    violence.prob > thresholds.violence ||
    (violence.classes &&
      (violence.classes.physical_violence > thresholds.violence ||
        violence.classes.firearm_threat > thresholds.violence ||
        violence.classes.combat_sport > thresholds.violence))
  ) {
    throw new AppError('Image contains violent content.', 400);
  }

  // 3. GORE CHECK
  const gore = result.gore || {};
  if (
    gore.prob > thresholds.gore ||
    (gore.classes &&
      (gore.classes.very_bloody > thresholds.gore ||
        gore.classes.body_organ > thresholds.gore ||
        gore.classes.serious_injury > thresholds.gore ||
        gore.classes.skull > thresholds.gore ||
        gore.classes.corpse > thresholds.gore))
  ) {
    throw new AppError('Image contains gore or graphic injury.', 400);
  }

  // 4. SELF-HARM CHECK
  const selfHarm = result['self-harm'] || {};
  if (
    selfHarm.prob > thresholds.selfHarm ||
    (selfHarm.type &&
      (selfHarm.type.real > thresholds.selfHarm ||
        selfHarm.type.fake > thresholds.selfHarm))
  ) {
    throw new AppError('Image contains self-harm content.', 400);
  }

  // 5. WEAPON CHECK
  const weapon = result.weapon || {};
  if (
    (weapon.classes &&
      (weapon.classes.firearm > thresholds.firearm ||
        weapon.classes.firearm_gesture > thresholds.firearm ||
        weapon.classes.knife > thresholds.knife)) ||
    (weapon.firearm_action &&
      (weapon.firearm_action.aiming_threat > thresholds.firearm ||
        weapon.firearm_action.aiming_camera > thresholds.firearm))
  ) {
    throw new AppError('Image contains weapon-related content.', 400);
  }

  // 6. OFFENSIVE SYMBOLS CHECK
  const offensive = result.offensive || {};
  if (
    offensive.nazi > thresholds.hate_symbol ||
    offensive.confederate > thresholds.hate_symbol ||
    offensive.supremacist > thresholds.hate_symbol ||
    offensive.terrorist > thresholds.hate_symbol ||
    offensive.middle_finger > thresholds.offensive
  ) {
    throw new AppError('Image contains offensive or hate symbols.', 400);
  }

  // 7. ALCOHOL/DRUGS CHECK
  if (result.alcohol?.prob > thresholds.alcohol) {
    throw new AppError('Image contains alcohol-related content.', 400);
  }

  const drug = result.recreational_drug || {};
  if (
    drug.prob > thresholds.drugs ||
    (drug.classes &&
      (drug.classes.cannabis > thresholds.drugs ||
        drug.classes.cannabis_drug > thresholds.drugs))
  ) {
    throw new AppError('Image contains drug-related content.', 400);
  }

  // 8. CONTEXT CHECK (optional)
  const context = nudity.context || {};
  if (
    context.indoor_other > thresholds.inappropriate_context ||
    context.outdoor_other > thresholds.inappropriate_context
  ) {
    if (nudity.suggestive > thresholds.suggestive * 0.5) {
      throw new AppError(
        'Image contains content in inappropriate context.',
        400
      );
    }
  }
};

module.exports = {
  checkImageContent,
  performContentChecks,
};
