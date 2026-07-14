<!--app/pages/admin/data-intake.vue-->
<template>
  <div class="intake-page">
    <div class="section-label">Real Content Setup</div>
    <h2 class="as-title">Data Intake</h2>
    <p class="intro">
      Use this to replace the placeholder demo content with real trail, guide,
      vehicle, live-expedition, story, and review information. Every
      submission below is saved as a <strong>draft</strong> — nothing you
      submit here appears on the live site until it's reviewed and published
      in the Strapi admin (Content Manager → find the entry → Publish).
    </p>
    <ul class="intro-list">
      <li>Fill in only what you have right now and submit — missing fields just stay empty on the draft.</li>
      <li>The live site keeps showing existing content the whole time; nothing breaks while data is incomplete.</li>
      <li>Each section below submits independently — finish one and come back for the others later.</li>
      <li>Once a draft looks complete, publish it in Strapi and it goes live immediately.</li>
      <li>To create your 4 active expeditions: first save the trail(s) below, publish them in Strapi, then use the "Live Expedition" section once per trip.</li>
    </ul>

    <!-- ============================================================ -->
    <!-- SECTION 1: TRAIL / ADVENTURE                                  -->
    <!-- ============================================================ -->
    <div class="intake-card">
      <div class="intake-card-header">
        <h3>🏔️ New Trail / Adventure</h3>
        <span class="intake-hint">Difficulty markers, schedule/calendar, location, vehicles used</span>
      </div>

      <div class="form-grid">
        <div class="field">
          <label class="input-label">Trail Name *</label>
          <input class="input" v-model="trail.title" placeholder="e.g. Rwenzori 72-Hour Survival Challenge" />
        </div>
        <div class="field">
          <label class="input-label">Tagline</label>
          <input class="input" v-model="trail.tagline" placeholder="One line summary shown on cards" />
        </div>

        <div class="field">
          <label class="input-label">Category</label>
          <select class="input" v-model="trail.category">
            <option value="">— Select —</option>
            <option value="survival">Survival</option>
            <option value="convoy">Convoy</option>
            <option value="mountain">Mountain</option>
            <option value="overland">Overland</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div class="field">
          <label class="input-label">Difficulty</label>
          <select class="input" v-model="trail.difficulty">
            <option value="">— Select —</option>
            <option value="beginner">Beginner</option>
            <option value="moderate">Moderate</option>
            <option value="extreme">Extreme</option>
          </select>
        </div>
        <div class="field">
          <label class="input-label">Difficulty Level (1–5)</label>
          <select class="input" v-model.number="trail.difficultyLevel">
            <option :value="null">— Select —</option>
            <option v-for="n in 5" :key="n" :value="n">{{ n }} {{ '★'.repeat(n) }}</option>
          </select>
        </div>

        <div class="field">
          <label class="input-label">Location</label>
          <input class="input" v-model="trail.location" placeholder="e.g. Rwenzori Mountains, Western Uganda" />
        </div>
        <div class="field">
          <label class="input-label">Terrain</label>
          <input class="input" v-model="trail.terrain" placeholder="e.g. High Altitude Wilderness" />
        </div>
        <div class="field">
          <label class="input-label">Altitude / Elevation</label>
          <input class="input" v-model="trail.altitude" placeholder="e.g. 4,200m" />
        </div>

        <div class="field">
          <label class="input-label">Duration</label>
          <input class="input" type="number" min="1" v-model.number="trail.duration" placeholder="e.g. 3" />
        </div>
        <div class="field">
          <label class="input-label">Duration Unit</label>
          <select class="input" v-model="trail.durationUnit">
            <option value="days">Days</option>
            <option value="hours">Hours</option>
          </select>
        </div>
        <div class="field">
          <label class="input-label">Max Group Size</label>
          <input class="input" type="number" min="1" v-model.number="trail.maxGroup" placeholder="e.g. 8" />
        </div>

        <div class="field">
          <label class="input-label">Base Price (USD)</label>
          <input class="input" type="number" min="0" v-model.number="trail.basePrice" placeholder="e.g. 890" />
        </div>
        <div class="field">
          <label class="input-label">Premium Price (USD)</label>
          <input class="input" type="number" min="0" v-model.number="trail.premiumPrice" placeholder="e.g. 1150" />
        </div>
        <div class="field">
          <label class="input-label">VIP Price (USD)</label>
          <input class="input" type="number" min="0" v-model.number="trail.vipPrice" placeholder="e.g. 2200" />
        </div>
      </div>

      <div class="field-block">
        <label class="input-label">Cover Image</label>
        <ImageUploadInput v-model="trail.image" />
      </div>

      <div class="field-block">
        <label class="input-label">Full Description / Tagline Detail</label>
        <textarea class="input" v-model="trail.descriptionLong" rows="3" placeholder="Longer description if you have one" />
      </div>

      <div class="field-block">
        <label class="input-label">Gallery Images</label>
        <p class="field-hint">Each image here uploads to the CMS Media Library directly — no URLs to paste.</p>
        <MultiImageUploadInput v-model="trail.gallery" />
      </div>

      <div class="field-block">
        <label class="input-label">Highlights</label>
        <TagListInput v-model="trail.highlights" placeholder="e.g. Summit before sunrise" item-label="Highlight" />
      </div>

      <div class="field-block">
        <label class="input-label">Itinerary (day by day)</label>
        <div class="repeat-card" v-for="(day, i) in trail.itinerary" :key="i">
          <div class="repeat-card-top"><strong>Day {{ i + 1 }}</strong><button type="button" class="tag-remove" @click="trail.itinerary.splice(i,1)">✕</button></div>
          <div class="form-grid">
            <div class="field"><label class="input-label">Day #</label><input class="input" type="number" v-model.number="day.day" /></div>
            <div class="field span-2"><label class="input-label">Title</label><input class="input" v-model="day.title" placeholder="e.g. Base Camp Orientation" /></div>
            <div class="field"><label class="input-label">Elevation</label><input class="input" v-model="day.elevation" placeholder="e.g. 1,646m" /></div>
            <div class="field"><label class="input-label">Distance</label><input class="input" v-model="day.distance" placeholder="e.g. 8km" /></div>
            <div class="field"><label class="input-label">Duration</label><input class="input" v-model="day.duration" placeholder="e.g. 6 hours" /></div>
          </div>
          <textarea class="input" v-model="day.description" rows="2" placeholder="What happens this day" />
        </div>
        <button type="button" class="tag-add" @click="trail.itinerary.push({ day: trail.itinerary.length+1, title:'', description:'', elevation:'', distance:'', duration:'' })">+ Add Day</button>
      </div>

      <div class="field-block">
        <label class="input-label">Requirements</label>
        <div class="form-grid">
          <div class="field"><label class="input-label">Fitness Level</label><input class="input" v-model="trail.requirements.fitness" placeholder="e.g. High – 12+ hrs hiking daily" /></div>
          <div class="field"><label class="input-label">Experience Needed</label><input class="input" v-model="trail.requirements.experience" placeholder="e.g. Some hiking experience" /></div>
          <div class="field"><label class="input-label">Age Range</label><input class="input" v-model="trail.requirements.age" placeholder="e.g. 18–60" /></div>
        </div>
        <label class="input-label" style="margin-top:10px;display:block;">Required Gear</label>
        <TagListInput v-model="trail.requirements.gear" placeholder="e.g. Waterproof hiking boots" item-label="Gear item" />
      </div>

      <div class="field-block">
        <label class="input-label">Optional Add-ons</label>
        <div class="repeat-card" v-for="(addon, i) in trail.addons" :key="i">
          <div class="repeat-card-top"><strong>Add-on {{ i + 1 }}</strong><button type="button" class="tag-remove" @click="trail.addons.splice(i,1)">✕</button></div>
          <div class="form-grid">
            <div class="field"><label class="input-label">Key (short id)</label><input class="input" v-model="addon.key" placeholder="e.g. gear" /></div>
            <div class="field"><label class="input-label">Label</label><input class="input" v-model="addon.label" placeholder="e.g. Full Gear Rental Kit" /></div>
            <div class="field"><label class="input-label">Price (USD)</label><input class="input" type="number" v-model.number="addon.price" placeholder="e.g. 120" /></div>
          </div>
        </div>
        <button type="button" class="tag-add" @click="trail.addons.push({ key:'', label:'', price: null })">+ Add Option</button>
      </div>

      <div class="field-block">
        <label class="input-label">Schedule / Upcoming Departures (this is your calendar)</label>
        <div class="repeat-card" v-for="(dep, i) in trail.departures" :key="i">
          <div class="repeat-card-top"><strong>Departure {{ i + 1 }}</strong><button type="button" class="tag-remove" @click="trail.departures.splice(i,1)">✕</button></div>
          <div class="form-grid">
            <div class="field"><label class="input-label">Date</label><input class="input" type="date" v-model="dep.date" /></div>
            <div class="field"><label class="input-label">Spots Left</label><input class="input" type="number" min="0" v-model.number="dep.spotsLeft" /></div>
            <div class="field">
              <label class="input-label">Status</label>
              <select class="input" v-model="dep.status">
                <option value="open">Open</option><option value="almost-full">Almost Full</option>
                <option value="full">Full</option><option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>
        <button type="button" class="tag-add" @click="trail.departures.push({ date:'', spotsLeft: null, status:'open' })">+ Add Departure Date</button>
      </div>

      <div class="field-block">
        <label class="input-label">Vehicles Used On This Trail</label>
        <p class="field-hint" v-if="!vehicles.length">No vehicles yet — add one in the Vehicle section, then come back to link it.</p>
        <div class="checkbox-grid" v-else>
          <label class="checkbox-item" v-for="v in vehicles" :key="v.id">
            <input type="checkbox" :value="v.id" v-model="trail.vehicleIds" /> {{ v.name }} <span class="checkbox-sub">({{ v.type }})</span>
          </label>
        </div>
      </div>

      <div class="field-block">
        <label class="input-label">Guides Assigned</label>
        <p class="field-hint" v-if="!guides.length">No guides yet — add one in the Guide section, then come back to link it.</p>
        <div class="checkbox-grid" v-else>
          <label class="checkbox-item" v-for="g in guides" :key="g.id">
            <input type="checkbox" :value="g.id" v-model="trail.guideIds" /> {{ g.name }} <span class="checkbox-sub">({{ g.role }})</span>
          </label>
        </div>
      </div>

      <div class="submit-row">
        <button class="btn btn-primary" :disabled="trailSaving || !trail.title" @click="submitTrail">{{ trailSaving ? 'Saving…' : '💾 Save Trail as Draft' }}</button>
        <button class="btn btn-ghost" @click="resetTrail" type="button">Clear Form</button>
        <span v-if="trailSuccess" class="success-msg">✅ Saved as draft — Content Manager → Adventure</span>
        <span v-if="trailError" class="error-msg">{{ trailError }}</span>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- SECTION 2: LIVE EXPEDITION (Active Expeditions)               -->
    <!-- ============================================================ -->
    <div class="intake-card">
      <div class="intake-card-header">
        <h3>📡 New Active Expedition</h3>
        <span class="intake-hint">Powers the "Live Tracking" section — repeat this once per active trip (you need at least 4)</span>
      </div>

      <p class="field-hint" v-if="!adventures.length" style="margin-bottom:16px;">Save and publish at least one Trail above first — expeditions must link to a trail.</p>

      <div class="form-grid">
        <div class="field span-2">
          <label class="input-label">Which Trail? *</label>
          <select class="input" v-model="expedition.adventureId">
            <option :value="null">— Select trail —</option>
            <option v-for="a in adventures" :key="a.id" :value="a.id">{{ a.title }}</option>
          </select>
        </div>
        <div class="field">
          <label class="input-label">Batch / Group Label</label>
          <input class="input" v-model="expedition.batchLabel" placeholder="e.g. Batch 24" />
        </div>

        <div class="field">
          <label class="input-label">Lead Guide</label>
          <select class="input" v-model="expedition.guideId">
            <option :value="null">— Select guide —</option>
            <option v-for="g in guides" :key="g.id" :value="g.id">{{ g.name }}</option>
          </select>
        </div>
        <div class="field">
          <label class="input-label">Departure Date</label>
          <input class="input" type="date" v-model="expedition.departureDate" />
        </div>
        <div class="field">
          <label class="input-label">Status</label>
          <select class="input" v-model="expedition.status">
            <option value="upcoming">Upcoming</option><option value="active">Active</option><option value="completed">Completed</option>
          </select>
        </div>

        <div class="field"><label class="input-label">Current Day</label><input class="input" type="number" min="1" v-model.number="expedition.currentDay" /></div>
        <div class="field"><label class="input-label">Total Days</label><input class="input" type="number" min="1" v-model.number="expedition.totalDays" /></div>
        <div class="field"><label class="input-label">Participants</label><input class="input" type="number" min="0" v-model.number="expedition.participants" /></div>
        <div class="field"><label class="input-label">Max Participants</label><input class="input" type="number" min="0" v-model.number="expedition.maxParticipants" /></div>
        <div class="field"><label class="input-label">Followers</label><input class="input" type="number" min="0" v-model.number="expedition.followers" /></div>

        <div class="field span-2"><label class="input-label">Current Location</label><input class="input" v-model="expedition.currentLocation" placeholder="e.g. Bujuku Valley" /></div>
        <div class="field"><label class="input-label">Current Elevation (m)</label><input class="input" type="number" v-model.number="expedition.currentElevation" /></div>

        <div class="field"><label class="input-label">Distance Covered (km)</label><input class="input" type="number" step="0.1" v-model.number="expedition.distanceCovered" /></div>
        <div class="field"><label class="input-label">Total Distance (km)</label><input class="input" type="number" step="0.1" v-model.number="expedition.totalDistance" /></div>
        <div class="field"><label class="input-label">Elevation Gain (m)</label><input class="input" type="number" v-model.number="expedition.elevationGain" /></div>

        <div class="field"><label class="input-label">Start Time</label><input class="input" v-model="expedition.startTime" placeholder="e.g. 07:00 AM" /></div>
        <div class="field"><label class="input-label">Elapsed Hours</label><input class="input" type="number" v-model.number="expedition.elapsedHours" /></div>
      </div>

      <div class="field-block">
        <label class="input-label">Weather</label>
        <div class="form-grid">
          <div class="field"><label class="input-label">Condition</label><input class="input" v-model="expedition.weather.condition" placeholder="e.g. Partly Cloudy" /></div>
          <div class="field"><label class="input-label">Temp</label><input class="input" v-model="expedition.weather.temp" placeholder="e.g. 8°C" /></div>
          <div class="field"><label class="input-label">Wind</label><input class="input" v-model="expedition.weather.wind" placeholder="e.g. 12 km/h" /></div>
          <div class="field"><label class="input-label">Humidity</label><input class="input" v-model="expedition.weather.humidity" placeholder="e.g. 78%" /></div>
        </div>
      </div>

      <div class="form-grid">
        <div class="field span-2"><label class="input-label">Cover Image</label><ImageUploadInput v-model="expedition.image" /></div>
        <div class="field span-2"><label class="input-label">Map Image</label><ImageUploadInput v-model="expedition.mapImage" /></div>
      </div>

      <div class="field-block">
        <label class="input-label">Team Members</label>
        <div class="repeat-card" v-for="(m, i) in expedition.team" :key="i">
          <div class="repeat-card-top"><strong>Member {{ i+1 }}</strong><button type="button" class="tag-remove" @click="expedition.team.splice(i,1)">✕</button></div>
          <div class="form-grid">
            <div class="field"><label class="input-label">Name</label><input class="input" v-model="m.name" placeholder="e.g. Lena M." /></div>
            <div class="field"><label class="input-label">Flag Emoji</label><input class="input" v-model="m.flag" placeholder="🇩🇪" /></div>
            <div class="field">
              <label class="input-label">Status</label>
              <select class="input" v-model="m.status"><option value="strong">Strong</option><option value="resting">Resting</option><option value="injured">Injured</option></select>
            </div>
          </div>
          <ImageUploadInput v-model="m.avatar" />
        </div>
        <button type="button" class="tag-add" @click="expedition.team.push({ name:'', flag:'', status:'strong', avatar:'' })">+ Add Team Member</button>
      </div>

      <div class="field-block">
        <label class="input-label">Checkpoints</label>
        <div class="repeat-card" v-for="(c, i) in expedition.checkpoints" :key="i">
          <div class="repeat-card-top"><strong>Checkpoint {{ i+1 }}</strong><button type="button" class="tag-remove" @click="expedition.checkpoints.splice(i,1)">✕</button></div>
          <div class="form-grid">
            <div class="field span-2"><label class="input-label">Name</label><input class="input" v-model="c.name" placeholder="e.g. Bujuku Valley" /></div>
            <div class="field">
              <label class="input-label">Status</label>
              <select class="input" v-model="c.status"><option value="completed">Completed</option><option value="current">Current</option><option value="upcoming">Upcoming</option></select>
            </div>
            <div class="field"><label class="input-label">Time</label><input class="input" v-model="c.time" placeholder="e.g. Day 2 · Active Now" /></div>
            <div class="field"><label class="input-label">Elevation</label><input class="input" v-model="c.elevation" placeholder="e.g. 3,962m" /></div>
          </div>
          <textarea class="input" v-model="c.note" rows="2" placeholder="Optional note" />
        </div>
        <button type="button" class="tag-add" @click="expedition.checkpoints.push({ name:'', status:'upcoming', time:'', elevation:'', note:'' })">+ Add Checkpoint</button>
      </div>

      <div class="field-block">
        <label class="input-label">Live Feed Posts</label>
        <div class="repeat-card" v-for="(p, i) in expedition.feed" :key="i">
          <div class="repeat-card-top"><strong>Post {{ i+1 }}</strong><button type="button" class="tag-remove" @click="expedition.feed.splice(i,1)">✕</button></div>
          <div class="form-grid">
            <div class="field span-2"><label class="input-label">Author</label><input class="input" v-model="p.author" placeholder="e.g. Samuel K., Lead Guide" /></div>
          </div>
          <textarea class="input" v-model="p.text" rows="2" placeholder="Update text" style="margin-bottom:10px;" />
          <ImageUploadInput v-model="p.image" />
        </div>
        <button type="button" class="tag-add" @click="expedition.feed.push({ image:'', text:'', author:'', postedAt: new Date().toISOString() })">+ Add Feed Post</button>
      </div>

      <div class="submit-row">
        <button class="btn btn-primary" :disabled="expeditionSaving || !expedition.adventureId" @click="submitExpedition">{{ expeditionSaving ? 'Saving…' : '💾 Save Expedition as Draft' }}</button>
        <button class="btn btn-ghost" @click="resetExpedition" type="button">Clear Form</button>
        <span v-if="expeditionSuccess" class="success-msg">✅ Saved as draft — Content Manager → Live Expedition</span>
        <span v-if="expeditionError" class="error-msg">{{ expeditionError }}</span>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- SECTION 3: ADVENTURE JOURNAL / STORY                           -->
    <!-- ============================================================ -->
    <div class="intake-card">
      <div class="intake-card-header">
        <h3>📖 New Adventure Journal Story</h3>
        <span class="intake-hint">Powers the "Adventure Journal" / stories section, with cover image upload</span>
      </div>
      <div class="form-grid">
        <div class="field span-2"><label class="input-label">Story Title *</label><input class="input" v-model="story.title" placeholder="e.g. How I Almost Gave Up on Day 2" /></div>
        <div class="field"><label class="input-label">Category</label><input class="input" v-model="story.category" placeholder="e.g. survival" /></div>
        <div class="field span-2">
          <label class="input-label">Related Trail (optional)</label>
          <select class="input" v-model="story.adventureId">
            <option :value="null">— None —</option>
            <option v-for="a in adventures" :key="a.id" :value="a.id">{{ a.title }}</option>
          </select>
        </div>
        <div class="field"><label class="input-label">Read Time (minutes)</label><input class="input" type="number" min="1" v-model.number="story.readTime" /></div>
        <div class="field"><label class="input-label">Publish Date</label><input class="input" type="date" v-model="story.publishDate" /></div>
        <div class="field checkbox-field"><label class="checkbox-item"><input type="checkbox" v-model="story.featured" /> Feature on homepage</label></div>
      </div>

      <div class="form-grid">
        <div class="field"><label class="input-label">Author Name</label><input class="input" v-model="story.author.name" placeholder="e.g. Lena Müller" /></div>
        <div class="field"><label class="input-label">Author Location</label><input class="input" v-model="story.author.location" placeholder="e.g. Berlin, Germany" /></div>
      </div>
      <div class="field-block"><label class="input-label">Author Photo</label><ImageUploadInput v-model="story.author.avatar" /></div>
      <div class="field-block"><label class="input-label">Cover Image</label><ImageUploadInput v-model="story.image" /></div>
      <div class="field-block"><label class="input-label">Excerpt (short teaser shown on cards)</label><textarea class="input" v-model="story.excerpt" rows="2" /></div>
      <div class="field-block"><label class="input-label">Full Story</label><textarea class="input" v-model="story.content" rows="8" placeholder="The full journal entry" /></div>
      <div class="field-block"><label class="input-label">Tags</label><TagListInput v-model="story.tags" placeholder="e.g. survival" item-label="Tag" /></div>

      <div class="submit-row">
        <button class="btn btn-primary" :disabled="storySaving || !story.title" @click="submitStory">{{ storySaving ? 'Saving…' : '💾 Save Story as Draft' }}</button>
        <button class="btn btn-ghost" @click="resetStory" type="button">Clear Form</button>
        <span v-if="storySuccess" class="success-msg">✅ Saved as draft — Content Manager → Story</span>
        <span v-if="storyError" class="error-msg">{{ storyError }}</span>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- SECTION 4: REVIEW ("What They Say")                           -->
    <!-- ============================================================ -->
    <div class="intake-card">
      <div class="intake-card-header">
        <h3>⭐ New Review</h3>
        <span class="intake-hint">Powers the "What They Say" section on the homepage</span>
      </div>
      <div class="form-grid">
        <div class="field span-2">
          <label class="input-label">Which Trail? *</label>
          <select class="input" v-model="review.adventureId">
            <option :value="null">— Select trail —</option>
            <option v-for="a in adventures" :key="a.id" :value="a.id">{{ a.title }}</option>
          </select>
        </div>
        <div class="field">
          <label class="input-label">Rating</label>
          <select class="input" v-model.number="review.rating"><option v-for="n in 5" :key="n" :value="n">{{ n }} {{ '★'.repeat(n) }}</option></select>
        </div>
        <div class="field span-2"><label class="input-label">Review Title</label><input class="input" v-model="review.title" placeholder="e.g. Three days that redefined who I am" /></div>
        <div class="field"><label class="input-label">Date</label><input class="input" type="date" v-model="review.date" /></div>
      </div>
      <div class="field-block"><label class="input-label">Review Text</label><textarea class="input" v-model="review.content" rows="4" /></div>
      <div class="form-grid">
        <div class="field"><label class="input-label">Reviewer Name</label><input class="input" v-model="review.author.name" placeholder="e.g. James O." /></div>
        <div class="field"><label class="input-label">Reviewer Location</label><input class="input" v-model="review.author.location" placeholder="e.g. UK" /></div>
        <div class="field checkbox-field"><label class="checkbox-item"><input type="checkbox" v-model="review.verified" /> Verified participant</label></div>
      </div>
      <div class="field-block"><label class="input-label">Reviewer Photo</label><ImageUploadInput v-model="review.author.avatar" /></div>

      <div class="submit-row">
        <button class="btn btn-primary" :disabled="reviewSaving || !review.adventureId || !review.content" @click="submitReviewForm">{{ reviewSaving ? 'Saving…' : '💾 Save Review as Draft' }}</button>
        <button class="btn btn-ghost" @click="resetReview" type="button">Clear Form</button>
        <span v-if="reviewSuccess" class="success-msg">✅ Saved as draft — Content Manager → Review</span>
        <span v-if="reviewError" class="error-msg">{{ reviewError }}</span>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- SECTION 5: GUIDE                                              -->
    <!-- ============================================================ -->
    <div class="intake-card">
      <div class="intake-card-header"><h3>🧭 New Guide</h3></div>
      <div class="form-grid">
        <div class="field"><label class="input-label">Full Name *</label><input class="input" v-model="guide.name" placeholder="e.g. Samuel Kato" /></div>
        <div class="field"><label class="input-label">Role</label><input class="input" v-model="guide.role" placeholder="e.g. Lead Survival Guide" /></div>
        <div class="field"><label class="input-label">Years of Experience</label><input class="input" type="number" min="0" v-model.number="guide.experience" /></div>
        <div class="field"><label class="input-label">Expeditions Completed</label><input class="input" type="number" min="0" v-model.number="guide.expeditions" /></div>
        <div class="field"><label class="input-label">Rating (0–5)</label><input class="input" type="number" min="0" max="5" step="0.1" v-model.number="guide.rating" /></div>
      </div>
      <div class="field-block"><label class="input-label">Photo</label><ImageUploadInput v-model="guide.avatar" /></div>
      <div class="field-block"><label class="input-label">Bio</label><textarea class="input" v-model="guide.bio" rows="3" /></div>
      <div class="field-block"><label class="input-label">Specialties</label><TagListInput v-model="guide.specialties" placeholder="e.g. High Altitude" item-label="Specialty" /></div>
      <div class="field-block"><label class="input-label">Certifications</label><TagListInput v-model="guide.certifications" placeholder="e.g. Wilderness First Responder" item-label="Certification" /></div>
      <div class="field-block"><label class="input-label">Languages Spoken</label><TagListInput v-model="guide.languages" placeholder="e.g. English" item-label="Language" /></div>

      <div class="submit-row">
        <button class="btn btn-primary" :disabled="guideSaving || !guide.name" @click="submitGuide">{{ guideSaving ? 'Saving…' : '💾 Save Guide as Draft' }}</button>
        <button class="btn btn-ghost" @click="resetGuide" type="button">Clear Form</button>
        <span v-if="guideSuccess" class="success-msg">✅ Saved as draft</span>
        <span v-if="guideError" class="error-msg">{{ guideError }}</span>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- SECTION 6: VEHICLE                                            -->
    <!-- ============================================================ -->
    <div class="intake-card">
      <div class="intake-card-header"><h3>🚙 New Vehicle</h3></div>
      <div class="form-grid">
        <div class="field"><label class="input-label">Vehicle Name *</label><input class="input" v-model="vehicle.name" placeholder="e.g. Beast I" /></div>
        <div class="field"><label class="input-label">Make / Model / Type</label><input class="input" v-model="vehicle.type" placeholder="e.g. Toyota Land Cruiser 79 Series" /></div>
        <div class="field"><label class="input-label">Passenger Capacity</label><input class="input" type="number" min="1" v-model.number="vehicle.capacity" /></div>
        <div class="field">
          <label class="input-label">Status</label>
          <select class="input" v-model="vehicle.status"><option value="available">Available</option><option value="on-trip">On Trip</option><option value="maintenance">Maintenance</option></select>
        </div>
        <div class="field"><label class="input-label">Last Maintenance Date</label><input class="input" type="date" v-model="vehicle.lastMaintenance" /></div>
      </div>
      <div class="field-block"><label class="input-label">Photo</label><ImageUploadInput v-model="vehicle.image" /></div>
      <div class="field-block"><label class="input-label">Features</label><TagListInput v-model="vehicle.features" placeholder="e.g. Winch, Snorkel, Roof tent" item-label="Feature" /></div>

      <div class="submit-row">
        <button class="btn btn-primary" :disabled="vehicleSaving || !vehicle.name" @click="submitVehicle">{{ vehicleSaving ? 'Saving…' : '💾 Save Vehicle as Draft' }}</button>
        <button class="btn btn-ghost" @click="resetVehicle" type="button">Clear Form</button>
        <span v-if="vehicleSuccess" class="success-msg">✅ Saved as draft</span>
        <span v-if="vehicleError" class="error-msg">{{ vehicleError }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })
useHead({ title: 'Data Intake – Admin – Summit Trail' })

const { data: vehicles }   = await useVehicles()
const { data: guides }    = await useGuides()
const { data: adventures } = await useAdventures()

// ── Trail / Adventure ──────────────────────────────────────────────────
function blankTrail() {
  return {
    title: '', tagline: '', descriptionLong: '',
    category: '', difficulty: '', difficultyLevel: null,
    location: '', terrain: '', altitude: '',
    duration: null, durationUnit: 'days', maxGroup: null,
    basePrice: null, premiumPrice: null, vipPrice: null,
    image: '', gallery: [], highlights: [],
    itinerary: [], requirements: { fitness: '', experience: '', age: '', gear: [] },
    addons: [], departures: [],
    vehicleIds: [], guideIds: [],
  }
}
const trail = reactive(blankTrail())
const trailSaving = ref(false)
const trailSuccess = ref(false)
const trailError = ref(null)
function resetTrail() { Object.assign(trail, blankTrail()); trailSuccess.value = false; trailError.value = null }
async function submitTrail() {
  trailSaving.value = true; trailSuccess.value = false; trailError.value = null
  try {
    const { descriptionLong, vehicleIds, guideIds, ...rest } = trail
    await $fetch('/api/cms/adventures', {
      method: 'POST',
      body: { data: { ...rest, tagline: rest.tagline || descriptionLong, vehicles: vehicleIds, guides: guideIds } },
    })
    resetTrail(); trailSuccess.value = true
  } catch (e) {
    trailError.value = e?.data?.statusMessage || 'Could not save. Check required fields and try again.'
  } finally { trailSaving.value = false }
}

// ── Live Expedition ─────────────────────────────────────────────────────
function blankExpedition() {
  return {
    adventureId: null, guideId: null, batchLabel: '', departureDate: '',
    currentDay: null, totalDays: null, status: 'upcoming',
    participants: null, maxParticipants: null, followers: null,
    currentLocation: '', currentElevation: null,
    distanceCovered: null, totalDistance: null, elevationGain: null,
    startTime: '', elapsedHours: null,
    weather: { condition: '', temp: '', wind: '', humidity: '' },
    image: '', mapImage: '',
    team: [], checkpoints: [], feed: [],
  }
}
const expedition = reactive(blankExpedition())
const expeditionSaving = ref(false)
const expeditionSuccess = ref(false)
const expeditionError = ref(null)
function resetExpedition() { Object.assign(expedition, blankExpedition()); expeditionSuccess.value = false; expeditionError.value = null }
async function submitExpedition() {
  expeditionSaving.value = true; expeditionSuccess.value = false; expeditionError.value = null
  try {
    const { adventureId, guideId, ...rest } = expedition
    await $fetch('/api/cms/live-expeditions', {
      method: 'POST',
      body: { data: { ...rest, adventure: adventureId, guide: guideId } },
    })
    resetExpedition(); expeditionSuccess.value = true
  } catch (e) {
    expeditionError.value = e?.data?.statusMessage || 'Could not save. Please try again.'
  } finally { expeditionSaving.value = false }
}

// ── Story ────────────────────────────────────────────────────────────────
function blankStory() {
  return {
    title: '', category: '', adventureId: null, readTime: null, publishDate: '', featured: false,
    author: { name: '', location: '', avatar: '' },
    image: '', excerpt: '', content: '', tags: [],
  }
}
const story = reactive(blankStory())
const storySaving = ref(false)
const storySuccess = ref(false)
const storyError = ref(null)
function resetStory() { Object.assign(story, blankStory()); storySuccess.value = false; storyError.value = null }
async function submitStory() {
  storySaving.value = true; storySuccess.value = false; storyError.value = null
  try {
    const { adventureId, ...rest } = story
    await $fetch('/api/cms/stories', { method: 'POST', body: { data: { ...rest, adventure: adventureId } } })
    resetStory(); storySuccess.value = true
  } catch (e) {
    storyError.value = e?.data?.statusMessage || 'Could not save. Please try again.'
  } finally { storySaving.value = false }
}

// ── Review ───────────────────────────────────────────────────────────────
function blankReview() {
  return { adventureId: null, rating: 5, title: '', content: '', date: '', verified: true, author: { name: '', location: '', avatar: '' } }
}
const review = reactive(blankReview())
const reviewSaving = ref(false)
const reviewSuccess = ref(false)
const reviewError = ref(null)
function resetReview() { Object.assign(review, blankReview()); reviewSuccess.value = false; reviewError.value = null }
async function submitReviewForm() {
  reviewSaving.value = true; reviewSuccess.value = false; reviewError.value = null
  try {
    const { adventureId, ...rest } = review
    await $fetch('/api/cms/reviews', { method: 'POST', body: { data: { ...rest, adventure: adventureId } } })
    resetReview(); reviewSuccess.value = true
  } catch (e) {
    reviewError.value = e?.data?.statusMessage || 'Could not save. Please try again.'
  } finally { reviewSaving.value = false }
}

// ── Guide ───────────────────────────────────────────────────────────────
function blankGuide() {
  return { name: '', role: '', experience: null, expeditions: null, rating: null, avatar: '', bio: '', specialties: [], certifications: [], languages: [] }
}
const guide = reactive(blankGuide())
const guideSaving = ref(false)
const guideSuccess = ref(false)
const guideError = ref(null)
function resetGuide() { Object.assign(guide, blankGuide()); guideSuccess.value = false; guideError.value = null }
async function submitGuide() {
  guideSaving.value = true; guideSuccess.value = false; guideError.value = null
  try {
    await $fetch('/api/cms/guides', { method: 'POST', body: { data: { ...guide } } })
    resetGuide(); guideSuccess.value = true
  } catch (e) {
    guideError.value = e?.data?.statusMessage || 'Could not save. Please try again.'
  } finally { guideSaving.value = false }
}

// ── Vehicle ─────────────────────────────────────────────────────────────
function blankVehicle() {
  return { name: '', type: '', capacity: null, status: 'available', lastMaintenance: '', image: '', features: [] }
}
const vehicle = reactive(blankVehicle())
const vehicleSaving = ref(false)
const vehicleSuccess = ref(false)
const vehicleError = ref(null)
function resetVehicle() { Object.assign(vehicle, blankVehicle()); vehicleSuccess.value = false; vehicleError.value = null }
async function submitVehicle() {
  vehicleSaving.value = true; vehicleSuccess.value = false; vehicleError.value = null
  try {
    await $fetch('/api/cms/vehicles', { method: 'POST', body: { data: { ...vehicle } } })
    resetVehicle(); vehicleSuccess.value = true
  } catch (e) {
    vehicleError.value = e?.data?.statusMessage || 'Could not save. Please try again.'
  } finally { vehicleSaving.value = false }
}
</script>

<style scoped>
.as-title { font-family: var(--font-display); font-size: 36px; color: var(--text); margin-bottom: 14px; }
.intro { color: var(--light); font-size: 14px; line-height: 1.6; max-width: 760px; margin-bottom: 10px; }
.intro-list { color: var(--gray); font-size: 13px; line-height: 1.8; max-width: 760px; margin-bottom: 32px; padding-left: 20px; }
.intake-card { background: var(--panel); border: 1px solid var(--border); padding: 28px; margin-bottom: 24px; }
.intake-card-header { display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; margin-bottom: 20px; }
.intake-card-header h3 { font-family: var(--font-display); font-size: 22px; color: var(--text); }
.intake-hint { font-size: 13px; color: var(--gray); }
.form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 16px; }
.field.span-2 { grid-column: span 2; }
.field-block { margin-bottom: 22px; }
.input-label { display: block; font-family: var(--font-condensed); font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--gray); margin-bottom: 6px; }
.field-hint { font-size: 13px; color: var(--gray); font-style: italic; margin-bottom: 8px; }
.repeat-card { border: 1px solid var(--border); padding: 16px; margin-bottom: 12px; border-radius: 4px; background: rgba(255,255,255,0.01); }
.repeat-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; color: var(--orange); font-family: var(--font-condensed); }
.tag-remove { background: none; border: 1px solid var(--border); color: var(--red); width: 28px; height: 28px; cursor: pointer; border-radius: 4px; }
.tag-remove:hover { background: rgba(192,57,43,0.1); }
.tag-add { align-self: flex-start; background: none; border: 1px dashed var(--border); color: var(--orange); font-family: var(--font-condensed); font-size: 13px; font-weight: 600; padding: 8px 14px; cursor: pointer; border-radius: 4px; }
.tag-add:hover { border-color: var(--orange); background: rgba(232,98,42,0.05); }
.checkbox-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
.checkbox-item { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--light); cursor: pointer; }
.checkbox-field { display: flex; align-items: flex-end; }
.checkbox-sub { color: var(--gray); font-size: 12px; }
.submit-row { display: flex; align-items: center; gap: 14px; margin-top: 10px; flex-wrap: wrap; }
.success-msg { color: var(--green-light); font-size: 13px; }
.error-msg { color: var(--red); font-size: 13px; }
@media (max-width: 900px) { .form-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } .field.span-2 { grid-column: span 1; } }
</style>