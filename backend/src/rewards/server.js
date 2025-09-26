const express = require('express');
const cors = require('cors');
const app = express();
const rewardsRoutes = require('./rewardsRoutes');

app.use(cors());
app.use(express.json());

app.use('/api/rewards', rewardsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
