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
      <div
        v-for="network in filteredNetworks"
        :key="network.id ? network.id : network.name"
        class="tree-item"
      >
        <div class="network-name">
          <div class="network-title">{{ network.name }}</div>
          <!-- Кнопки редактировать/удалить, показываются только если объект имеет id -->
          <div class="network-actions" v-if="network.id">
            <button @click="editNetwork(network)" class="edit-button">Редактировать</button>
            <button @click="deleteNetwork(network.id)" class="delete-button">Удалить</button>
          </div>
        </div>
        <div v-if="network.children && network.children.length" class="subtree">
          <div
            v-for="child in network.children"
            :key="child.id"
            class="tree-item"
          >
            <div class="network-name">
              <div class="network-title">{{ child.name }}</div>
              <div class="network-actions">
                <button @click="editNetwork(child)" class="edit-button">Редактировать</button>
                <button @click="deleteNetwork(child.id)" class="delete-button">Удалить</button>
              </div>
            </div>
            <div v-if="child.children && child.children.length" class="subtree">
              <div
                v-for="subchild in child.children"
                :key="subchild.id"
                class="tree-item"
              >
                <div class="network-name">
                  <div class="network-title">{{ subchild.name }}</div>
                  <div class="network-actions">
                    <button @click="editNetwork(subchild)" class="edit-button">Редактировать</button>
                    <button @click="deleteNetwork(subchild.id)" class="delete-button">Удалить</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Форма редактирования сети -->
    <div v-if="editingNetwork" class="edit-form-container">
      <h2>Редактировать сеть</h2>
      <label for="editName">Имя сети:</label>
      <input v-model="editingNetwork.name" class="input-field" />

      <label for="editCidr">CIDR сети:</label>
      <input v-model="editingNetwork.cidr" class="input-field" />

      <label for="editParentId">ID родительской сети:</label>
      <input v-model="editingNetwork.parent_id" type="number" class="input-field" />

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
      allNetworks: [],
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
        // Применяем группировку. Если группировка не нужна, можно использовать данные напрямую.
        this.networks = this.formatHierarchy(response.data);
        this.allNetworks = [...this.networks];
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
      this.filteredNetworks = this.networks.filter(network => this.isIpInNetwork(this.searchIp, network));
      if (this.filteredNetworks.length === 0) {
        alert('Сеть по данному IP не найдена!');
        this.filteredNetworks = [...this.networks];
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
      this.filteredNetworks = [...this.allNetworks];
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
    // Редактирование: если объект имеет id, редактируем его;
    // если группа (без id) с единственным элементом в children – редактируем этот элемент.
    editNetwork(network) {
      if (!network.id) {
        if (network.children && network.children.length === 1) {
          this.editingNetwork = { ...network.children[0] };
        } else {
          alert('Невозможно редактировать группу сетей. Выберите конкретную сеть.');
          return;
        }
      } else {
        this.editingNetwork = { ...network };
      }
    },
    // Рекурсивное обновление дерева: обновляем только тот объект,
    // id которого совпадает с отредактированным
    updateNetworkInTree(networks, updatedNetwork) {
      return networks.map(network => {
        if (network.id === updatedNetwork.id) {
          return { ...updatedNetwork };
        } else if (network.children && network.children.length > 0) {
          return { ...network, children: this.updateNetworkInTree(network.children, updatedNetwork) };
        }
        return network;
      });
    },
    saveNetwork() {
      if (!this.editingNetwork) return;
      this.networks = this.updateNetworkInTree(this.networks, this.editingNetwork);
      // Глубокое копирование для обновления filteredNetworks
      this.filteredNetworks = JSON.parse(JSON.stringify(this.networks));
      this.editingNetwork = null;
    },
    cancelEdit() {
      this.editingNetwork = null;
    },
    async deleteNetwork(id) {
      try {
        await axios.delete(`/api/api/v1/network/${id}`);
        await this.fetchNetworks();
      } catch (error) {
        console.error('Ошибка при удалении сети:', error);
      }
    },
    async addNetwork() {
      try {
        const newNetwork = {
          name: this.newNetworkName,
          cidr: this.newNetworkCidr,
          parent_id: this.newNetworkParentId,
        };
        const response = await axios.post(`/api/api/v1/network/`, newNetwork);
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
/* Исходные стили, как у вас были */
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
.network-name {
  font-weight: bold;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}
.network-title {
  flex: 1 1 auto;
}
.network-actions {
  display: flex;
  gap: 10px;
  flex: 0 0 auto;
}
/* Адаптивность: при ширине экрана до 600px кнопки становятся блочными и переносятся вниз */
@media (max-width: 600px) {
  .network-actions {
    width: 100%;
    margin-top: 5px;
    justify-content: flex-start;
  }
  .network-name {
    flex-direction: column;
    align-items: flex-start;
  }
}
.edit-button,
.delete-button {
  padding: 5px 10px;
  font-size: 14px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.edit-button:hover,
.delete-button:hover {
  background-color: #0056b3;
}
.subtree {
  margin-left: 20px;
}
.edit-form-container {
  margin-top: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.input-field {
  display: block;
  width: 100%;
  padding: 8px 10px;
  margin-bottom: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.action-button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}
.action-button:hover {
  background-color: #45a049;
}
.cancel-button {
  padding: 10px 20px;
  background-color: #FF5722;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.cancel-button:hover {
  background-color: #d45d16;
}
</style>
