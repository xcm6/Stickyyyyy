/**
 * Sticky Visualization for Processing
 * 
 * This sketch connects to Sticky API and visualizes:
 * - Total check-ins (particle count)
 * - Rankings (bar chart)
 * - Activity over time (waveform)
 * - Mood distribution (color palette)
 * 
 * Instructions:
 * 1. Update API_URL to your server address
 * 2. Run this sketch
 * 3. Data updates every 5 seconds
 */

String API_URL = "http://localhost:8000/api.html?format=json";
// For Raspberry Pi, use: "http://your-server-ip/api.html?format=json"

JSONObject data;
int lastUpdate = 0;
int updateInterval = 5000; // 5 seconds

// Visualization parameters
int particleCount = 0;
ArrayList<Particle> particles;
float[] barHeights;
String[] topUsers;
int[] userCheckIns;

// Color palette based on moods
color[] moodColors = {
  color(255, 100, 100), // 🔥 Red
  color(100, 100, 100), // 💀 Gray
  color(100, 255, 100), // 🍀 Green
  color(200, 200, 255), // 💤 Blue
  color(255, 255, 100), // 🎉 Yellow
  color(100, 255, 255), // 💻 Cyan
  color(200, 150, 100), // ☕ Brown
  color(255, 150, 200), // 😭 Pink
  color(255, 150, 100), // 😡 Orange
  color(255, 100, 150), // ❤️ Red-Pink
  color(150, 100, 255), // 🚀 Purple
  color(255, 255, 255)  // ✨ White
};

// Game type colors
color[] gameColors = {
  color(255, 100, 100), // math - Red
  color(100, 255, 100), // slider - Green
  color(100, 100, 255), // puzzle - Blue
  color(255, 255, 100), // connect - Yellow
  color(255, 100, 255), // dodge - Magenta
  color(100, 255, 255), // reaction - Cyan
  color(255, 200, 100)  // target - Orange
};

String[] gameNames = {"math", "slider", "puzzle", "connect", "dodge", "reaction", "target"};
int[] gameCounts = new int[7];

void setup() {
  size(1200, 800);
  background(250);
  
  particles = new ArrayList<Particle>();
  barHeights = new float[10];
  topUsers = new String[10];
  userCheckIns = new int[10];
  
  // Initial data load
  loadData();
}

void draw() {
  background(250);
  
  // Update data periodically
  if (millis() - lastUpdate > updateInterval) {
    loadData();
    lastUpdate = millis();
  }
  
  if (data == null) {
    fill(0);
    textAlign(CENTER);
    text("Loading data...", width/2, height/2);
    return;
  }
  
  // Draw visualization based on data
  drawSummary();
  drawRankings();
  drawActivityWave();
  drawMoodDistribution();
  drawGameStats();
  drawParticles();
  
  // Draw update indicator
  fill(100);
  textAlign(RIGHT);
  textSize(10);
  text("Last update: " + (millis() - lastUpdate)/1000 + "s ago", width - 10, height - 10);
}

void loadData() {
  try {
    data = loadJSONObject(API_URL);
    
    if (data != null) {
      // Update particle count based on total check-ins
      JSONObject summary = data.getJSONObject("summary");
      int totalCheckIns = summary.getInt("total_check_ins");
      
      // More check-ins = more particles
      particleCount = min(totalCheckIns / 10, 500); // Cap at 500 particles
      
      // Update rankings
      JSONArray rankings = data.getJSONObject("rankings").getJSONArray("top_users");
      for (int i = 0; i < min(rankings.size(), 10); i++) {
        JSONObject user = rankings.getJSONObject(i);
        topUsers[i] = user.getString("username");
        userCheckIns[i] = user.getInt("check_ins");
        barHeights[i] = map(userCheckIns[i], 0, max(userCheckIns), 0, height/3);
      }
      
      // Update game statistics
      if (data.hasKey("games")) {
        JSONObject games = data.getJSONObject("games");
        for (int i = 0; i < gameNames.length; i++) {
          if (games.hasKey(gameNames[i])) {
            gameCounts[i] = games.getInt(gameNames[i]);
          }
        }
      }
      
      // Update particles
      updateParticles();
    }
  } catch (Exception e) {
    println("Error loading data: " + e.getMessage());
  }
}

void drawSummary() {
  if (data == null) return;
  
  JSONObject summary = data.getJSONObject("summary");
  
  fill(0);
  textAlign(LEFT);
  textSize(24);
  text("STICKY STATS", 20, 40);
  
  textSize(14);
  text("Total Check-ins: " + summary.getInt("total_check_ins"), 20, 70);
  text("Total Users: " + summary.getInt("total_users"), 20, 90);
  text("Total Groups: " + summary.getInt("total_groups"), 20, 110);
  text("Active Days: " + summary.getInt("active_days"), 20, 130);
}

void drawRankings() {
  fill(0);
  textAlign(LEFT);
  textSize(16);
  text("TOP USERS", 20, 200);
  
  float barWidth = (width - 60) / 10;
  float startX = 30;
  float baseY = height - 150;
  
  for (int i = 0; i < 10; i++) {
    if (topUsers[i] != null) {
      // Bar color intensity based on ranking
      float intensity = map(i, 0, 9, 255, 100);
      fill(intensity);
      
      rect(startX + i * barWidth, baseY - barHeights[i], barWidth - 5, barHeights[i]);
      
      // Label
      fill(0);
      textSize(8);
      textAlign(CENTER);
      text(topUsers[i].substring(0, min(6, topUsers[i].length())), 
           startX + i * barWidth + barWidth/2, baseY + 15);
      text(userCheckIns[i], startX + i * barWidth + barWidth/2, baseY + 30);
    }
  }
}

void drawActivityWave() {
  if (data == null) return;
  
  JSONObject activity = data.getJSONObject("activity");
  JSONObject daily = activity.getJSONObject("daily");
  
  stroke(0);
  strokeWeight(2);
  noFill();
  
  beginShape();
  float step = width / 30.0;
  float maxValue = 0;
  
  // Find max value
  for (int i = 0; i < 30; i++) {
    String dateKey = getDateKey(i);
    if (daily.hasKey(dateKey)) {
      maxValue = max(maxValue, daily.getInt(dateKey));
    }
  }
  
  // Draw waveform
  for (int i = 0; i < 30; i++) {
    String dateKey = getDateKey(i);
    float value = daily.hasKey(dateKey) ? daily.getInt(dateKey) : 0;
    float y = map(value, 0, max(maxValue, 1), height/2, height/2 - 100);
    vertex(i * step, y);
  }
  endShape();
  
  fill(0);
  textAlign(LEFT);
  textSize(12);
  text("Daily Activity (Last 30 Days)", 20, height/2 - 120);
}

String getDateKey(int daysAgo) {
  java.util.Calendar cal = java.util.Calendar.getInstance();
  cal.add(java.util.Calendar.DAY_OF_YEAR, -daysAgo);
  int year = cal.get(java.util.Calendar.YEAR);
  int month = cal.get(java.util.Calendar.MONTH) + 1;
  int day = cal.get(java.util.Calendar.DAY_OF_MONTH);
  return String.format("%d-%02d-%02d", year, month, day);
}

void drawMoodDistribution() {
  if (data == null) return;
  
  JSONObject moods = data.getJSONObject("moods");
  
  fill(0);
  textAlign(LEFT);
  textSize(12);
  text("Mood Distribution", width - 200, 200);
  
  float startX = width - 200;
  float startY = 230;
  float boxSize = 30;
  int index = 0;
  
  for (Object key : moods.keys().toArray()) {
    String mood = (String)key;
    int count = moods.getInt(mood);
    
    // Map mood to color
    color c = getMoodColor(mood);
    fill(c);
    rect(startX, startY + index * (boxSize + 5), boxSize, boxSize);
    
    fill(0);
    textSize(10);
    text(mood + ": " + count, startX + boxSize + 5, startY + index * (boxSize + 5) + 20);
    
    index++;
    if (index > 8) break; // Limit display
  }
}

color getMoodColor(String mood) {
  String[] moodEmojis = {"🔥", "💀", "🍀", "💤", "🎉", "💻", "☕", "😭", "😡", "❤️", "🚀", "✨"};
  for (int i = 0; i < moodEmojis.length; i++) {
    if (mood.equals(moodEmojis[i])) {
      return moodColors[i];
    }
  }
  return color(200); // Default gray
}

void drawGameStats() {
  fill(0);
  textAlign(LEFT);
  textSize(12);
  text("Game Statistics", 20, height - 200);
  
  float startX = 20;
  float startY = height - 180;
  float barWidth = (width - 60) / 7;
  float maxGames = max(max(gameCounts), 1);
  
  for (int i = 0; i < gameNames.length; i++) {
    float barHeight = map(gameCounts[i], 0, maxGames, 0, 100);
    
    fill(gameColors[i]);
    rect(startX + i * barWidth, startY - barHeight, barWidth - 5, barHeight);
    
    fill(0);
    textSize(8);
    textAlign(CENTER);
    text(gameNames[i], startX + i * barWidth + barWidth/2, startY + 15);
    text(gameCounts[i], startX + i * barWidth + barWidth/2, startY + 30);
  }
}

void drawParticles() {
  // Particle count scales with total check-ins
  // Color intensity based on game variety
  int totalGames = sum(gameCounts);
  float gameVariety = totalGames > 0 ? (float)distinctGames() / gameNames.length : 0;
  
  for (Particle p : particles) {
    // Adjust particle color based on game variety
    if (gameVariety > 0.5) {
      p.update();
    }
    p.display();
  }
}

int distinctGames() {
  int count = 0;
  for (int i = 0; i < gameCounts.length; i++) {
    if (gameCounts[i] > 0) count++;
  }
  return count;
}

int sum(int[] arr) {
  int total = 0;
  for (int val : arr) {
    total += val;
  }
  return total;
}

void updateParticles() {
  // Adjust particle count based on data
  while (particles.size() < particleCount) {
    particles.add(new Particle(random(width), random(height)));
  }
  while (particles.size() > particleCount) {
    particles.remove(0);
  }
}

class Particle {
  float x, y;
  float vx, vy;
  float size;
  color c;
  
  Particle(float x, float y) {
    this.x = x;
    this.y = y;
    this.vx = random(-2, 2);
    this.vy = random(-2, 2);
    this.size = random(3, 8);
    // Use game colors if games are being played
    if (sum(gameCounts) > 0) {
      int gameIndex = (int)random(gameNames.length);
      this.c = gameColors[gameIndex];
    } else {
      this.c = moodColors[(int)random(moodColors.length)];
    }
  }
  
  void update() {
    x += vx;
    y += vy;
    
    // Bounce off edges
    if (x < 0 || x > width) vx *= -1;
    if (y < 0 || y > height) vy *= -1;
    
    // Keep in bounds
    x = constrain(x, 0, width);
    y = constrain(y, 0, height);
  }
  
  void display() {
    fill(c, 150);
    noStroke();
    ellipse(x, y, size, size);
  }
}

