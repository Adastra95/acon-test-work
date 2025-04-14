<template>
  <div id="app">
    <h1 class="title">Иерархия сетей</h1>

    <!-- Поле ввода и кнопка для поиска -->
    <div class="search-container">
      <input
        type="text"
        v-model="searchIp"
        placeholder="Введите IP-адрес"
        class="search-input"
      />
      <button @click="searchNetwork" class="search-button">Поиск</button>
    </div>

    <!-- Кнопка "Назад" для сброса поиска -->
    <div v-if="filteredNetworks.length > 0" class="back-container">
      <button @click="resetSearch" class="back-button">Назад</button>
    </div>

    <!-- Форма для ввода данных о пуле -->
    <div class="pool-container">
      <h2>Выделение пула из сети</h2>
      <label for="firstAddress">Первый адрес:</label>
      <input v-model="firstAddress" type="text" placeholder="Первый адрес" />
      
      <label for="lastAddress">Последний адрес:</label>
      <input v-model="lastAddress" type="text" placeholder="Последний адрес" />
      
      <label for="poolSize">Размер пула:</label>
      <input v-model="poolSize" type="number" placeholder="Размер пула" />
      
      <button @click="calculatePool" class="calculate-button">Рассчитать пул</button>
      
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      
      <div v-if="calculatedPool">
        <h3>Рассчитанный пул:</h3>
        <p>Первый адрес: {{ calculatedPool.firstAddress }}</p>
        <p>Последний адрес: {{ calculatedPool.lastAddress }}</p>
        <p>Размер пула: {{ calculatedPool.poolSize }}</p>
      </div>
    </div>

    <!-- Список сетей -->
    <div class="tree" v-if="filteredNetworks.length > 0">
      <div v-for="network in filteredNetworks" :key="network.id" class="tree-item">
        <div class="network-name">
          {{ network.name }}
          <button @click="editNetwork(network)" class="edit-button">Редактировать</button>
          <button @click="deleteNetwork(network.id)" class="delete-button">Удалить</button>
        </div>
        <div v-if="network.children && network.children.length" class="subtree">
          <div v-for="child in network.children" :key="child.id" class="tree-item">
            <div class="network-name">
              {{ child.name }}
              <button @click="editNetwork(child)" class="edit-button">Редактировать</button>
              <button @click="deleteNetwork(child.id)" class="delete-button">Удалить</button>
            </div>
            <div v-if="child.children && child.children.length" class="subtree">
              <div v-for="subchild in child.children" :key="subchild.id" class="tree-item">
                <div class="network-name">{{ subchild.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Форма редактирования сети -->
    <div v-if="editingNetwork" class="edit-form-container">
      <h2>Редактировать сеть</h2>
      <input v-model="editingNetwork.name" class="input-field" />
      <button @click="saveNetwork" class="action-button">Сохранить изменения</button>
      <button @click="cancelEdit" class="cancel-button">Отменить</button>
    </div>



    <!-- Форма для добавления новой сети -->
    <div class="add-network-container">
      <h2>Добавить новую сеть</h2>
      <input v-model="newNetworkName" type="text" placeholder="Имя новой сети" class="input-field" />
      <input v-model="newNetworkCidr" type="text" placeholder="CIDR новой сети" class="input-field" />
      <input v-model="newNetworkParentId" type="number" placeholder="ID родительской сети" class="input-field" />
      <button @click="addNetwork" class="add-network-button">Добавить сеть</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'App',
  data() {
  return {
    networks: [],
    allNetworks: [], // Добавляем новую переменную для хранения всех сетей
    searchIp: '',
    filteredNetworks: [],
    firstAddress: '',
    lastAddress: '',
    poolSize: '',
    errorMessage: '',
    calculatedPool: null,
    editingNetwork: null,
    newNetworkName: '',
    newNetworkCidr: '',
    newNetworkParentId: 0,
  };
},
  mounted() {
    this.fetchNetworks();
  },
  methods: {
    async fetchNetworks() {
  try {
    const response = await axios.get('http://82.144.67.254:9000/api/v1/network');
    this.networks = this.formatHierarchy(response.data);
    this.allNetworks = [...this.networks]; // Сохраняем все сети
    this.filteredNetworks = this.networks;
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
  }
},
    formatHierarchy(data) {
      const groups = {};
      data.forEach(network => {
        const prefix = network.name && network.name.split('_')[1];
        if (!prefix) return;
        if (!groups[prefix]) groups[prefix] = [];
        groups[prefix].push(network);
      });

      return Object.keys(groups).map(prefix => ({
        name: `net_${prefix}`,
        children: groups[prefix],
      }));
    },
    searchNetwork() {
  if (!this.isValidIp(this.searchIp)) {
    alert('Введите корректный IP-адрес!');
    return;
  }

  // Фильтрация сетей по введенному IP
  this.filteredNetworks = this.networks.filter(network => this.isIpInNetwork(this.searchIp, network));

  // Если сетей не найдено, показываем алерт и восстанавливаем все сети
  if (this.filteredNetworks.length === 0) {
    alert('Сеть по данному IP не найдена!');
    this.filteredNetworks = [...this.networks];  // Восстановление всех сетей после алерта
  }
},

    isValidIp(ip) {
      return ip && ip.match(/^(\d{1,3}\.){3}\d{1,3}$/);
    },
    isIpInNetwork(ip, network) {
      const networkPrefix = network.name.split('_')[1];
      return ip.startsWith(networkPrefix);
    },
    resetSearch() {
  this.filteredNetworks = [...this.allNetworks]; // Восстанавливаем все сети
  this.searchIp = '';
},

    calculatePool() {
      this.errorMessage = '';
      if (this.firstAddress && this.lastAddress) {
        const firstIp = this.ipToInt(this.firstAddress);
        const lastIp = this.ipToInt(this.lastAddress);
        if (firstIp >= lastIp) {
          this.errorMessage = 'Первый адрес должен быть меньше последнего адреса.';
          return;
        }
        this.poolSize = lastIp - firstIp + 1;
        this.calculatedPool = { firstAddress: this.firstAddress, lastAddress: this.lastAddress, poolSize: this.poolSize };
      } else if (this.firstAddress && this.poolSize) {
        const firstIp = this.ipToInt(this.firstAddress);
        const lastIp = firstIp + this.poolSize - 1;
        this.lastAddress = this.intToIp(lastIp);
        this.calculatedPool = { firstAddress: this.firstAddress, lastAddress: this.lastAddress, poolSize: this.poolSize };
      } else if (this.lastAddress && this.poolSize) {
        const lastIp = this.ipToInt(this.lastAddress);
        const firstIp = lastIp - this.poolSize + 1;
        this.firstAddress = this.intToIp(firstIp);
        this.calculatedPool = { firstAddress: this.firstAddress, lastAddress: this.lastAddress, poolSize: this.poolSize };
      } else {
        this.errorMessage = 'Необходимо задать два из трёх параметров: первый адрес, последний адрес, размер пула.';
      }
    },
    ipToInt(ip) {
      return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
    },
    intToIp(int) {
      return [(int >>> 24) & 255, (int >>> 16) & 255, (int >>> 8) & 255, int & 255].join('.');
    },
    editNetwork(network) {
      this.editingNetwork = { ...network };
    },
    saveNetwork() {
      const index = this.networks.findIndex(network => network.id === this.editingNetwork.id);
      if (index !== -1) {
        this.networks[index] = this.editingNetwork;
        this.filteredNetworks = this.networks;
      }
      this.editingNetwork = null;
    },
    cancelEdit() {
      this.editingNetwork = null;
    },
    async deleteNetwork(id) {
      try {
        await axios.delete(`http://82.144.67.254:9000/api/v1/network/${id}`);
        this.networks = this.networks.filter(network => network.id !== id);
        this.filteredNetworks = this.filteredNetworks.filter(network => network.id !== id);
      } catch (error) {
        console.error('Ошибка при удалении сети:', error);
      }
    },
    async addNetwork() {
      try {
        const newNetwork = {
          name: this.newNetworkName,
          cidr: this.newNetworkCidr,
          parentId: this.newNetworkParentId,
        };
        const response = await axios.post('http://82.144.67.254:9000/api/v1/network', newNetwork);
        this.networks.push(response.data);
        this.filteredNetworks = this.networks;
        this.newNetworkName = '';
        this.newNetworkCidr = '';
        this.newNetworkParentId = 0;
      } catch (error) {
        console.error('Ошибка при добавлении сети:', error);
      }
    },
  },
};
</script>

<style scoped>

.add-network-container {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
}

.add-network-container h2 {
  margin-bottom: 10px;
}

.add-network-button {
  margin-top: 10px;
  padding: 10px;
  background-color: #28a745;
  color: white;
  border: none;
  cursor: pointer;
}

.add-network-button:hover {
  background-color: #218838;
}
.pool-container {
  margin-top: 30px;
  padding: 20px;
  background-color: #e0f7fa;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.pool-container input {
  padding: 10px;
  font-size: 16px;
  margin-right: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 180px;
}

.calculate-button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.calculate-button:hover {
  background-color: #45a049;
}

.error-message {
  color: red;
  font-size: 16px;
  margin-top: 10px;
}

.no-results {
  color: red;
  text-align: center;
  margin-top: 20px;
  font-size: 18px;
}

.search-container {
  margin-bottom: 20px;
}

.search-input {
  padding: 8px;
  font-size: 16px;
  width: 200px;
}

.search-button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.search-button:hover {
  background-color: #0b7dda;
}

.back-container {
  margin-top: 10px;
}

.back-button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #FF5722;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.back-button:hover {
  background-color: #d45d16;
}

.tree {
  margin-top: 30px;
}

.tree-item {
  padding: 10px;
  background-color: #f0f0f0;
  margin: 5px 0;
  border-radius: 4px;
}

.subtree {
  margin-left: 20px;
}

.network-name {
  font-weight: bold;
}

.title {
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
}

.delete-button {
  padding: 5px 10px;
  font-size: 14px;
  background-color: #FF5722;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: auto; /* Сдвигает кнопку вправо */
}

.delete-button:hover {
  background-color: #d45d16;
}

.network-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
/* Стили для компонентов останутся прежними, добавим необходимые для управления сетями */
.add-network-container {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
}

.add-network-container h2 {
  margin-bottom: 10px;
}

.add-network-button {
  margin-top: 10px;
  padding: 10px;
  background-color: #28a745;
  color: white;
  border: none;
  cursor: pointer;
}

.add-network-button:hover {
  background-color: #218838;
}
</style>