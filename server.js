const axios = require('axios');

// URL API для добавления сети
const apiUrl = 'http://82.144.67.254:9000/api/v1/network';

// Данные для создания нескольких сетей с подсетями
const networks = [
  {
    name: 'network_1',
    cidr: '192.168.1.0/24',
    parent_id: 0,
    subnets: [
      { name: 'subnet_1_1', cidr: '192.168.1.0/25', parent_id: 1 },
      { name: 'subnet_1_2', cidr: '192.168.1.128/26', parent_id: 1 },
      { name: 'subnet_1_3', cidr: '192.168.1.192/27', parent_id: 1 },
    ]
  },
  {
    name: 'network_2',
    cidr: '10.0.0.0/16',
    parent_id: 0,
    subnets: [
      { name: 'subnet_2_1', cidr: '10.0.0.0/24', parent_id: 2 },
      { name: 'subnet_2_2', cidr: '10.0.1.0/24', parent_id: 2 },
      { name: 'subnet_2_3', cidr: '10.0.2.0/25', parent_id: 2 },
      { name: 'subnet_2_4', cidr: '10.0.3.0/25', parent_id: 2 },
    ]
  },
  {
    name: 'network_3',
    cidr: '172.16.0.0/12',
    parent_id: 0,
    subnets: [
      { name: 'subnet_3_1', cidr: '172.16.0.0/24', parent_id: 3 },
      { name: 'subnet_3_2', cidr: '172.16.1.0/24', parent_id: 3 },
      { name: 'subnet_3_3', cidr: '172.16.2.0/23', parent_id: 3 },
    ]
  },
  {
    name: 'network_4',
    cidr: '192.168.100.0/22',
    parent_id: 0,
    subnets: [
      { name: 'subnet_4_1', cidr: '192.168.100.0/24', parent_id: 4 },
      { name: 'subnet_4_2', cidr: '192.168.101.0/25', parent_id: 4 },
      { name: 'subnet_4_3', cidr: '192.168.102.0/25', parent_id: 4 },
    ]
  },
  {
    name: 'network_5',
    cidr: '192.168.200.0/24',
    parent_id: 0,
    subnets: [
      { name: 'subnet_5_1', cidr: '192.168.200.0/25', parent_id: 5 },
      { name: 'subnet_5_2', cidr: '192.168.200.128/26', parent_id: 5 },
      { name: 'subnet_5_3', cidr: '192.168.200.192/27', parent_id: 5 },
    ]
  },
  {
    name: 'network_6',
    cidr: '10.1.0.0/16',
    parent_id: 0,
    subnets: [
      { name: 'subnet_6_1', cidr: '10.1.0.0/24', parent_id: 6 },
      { name: 'subnet_6_2', cidr: '10.1.1.0/24', parent_id: 6 },
      { name: 'subnet_6_3', cidr: '10.1.2.0/25', parent_id: 6 },
    ]
  },
  {
    name: 'network_7',
    cidr: '172.20.0.0/14',
    parent_id: 0,
    subnets: [
      { name: 'subnet_7_1', cidr: '172.20.0.0/24', parent_id: 7 },
      { name: 'subnet_7_2', cidr: '172.20.1.0/25', parent_id: 7 },
      { name: 'subnet_7_3', cidr: '172.20.2.0/26', parent_id: 7 },
    ]
  },
  {
    name: 'network_8',
    cidr: '192.0.2.0/24',
    parent_id: 0,
    subnets: [
      { name: 'subnet_8_1', cidr: '192.0.2.0/25', parent_id: 8 },
      { name: 'subnet_8_2', cidr: '192.0.2.128/26', parent_id: 8 },
      { name: 'subnet_8_3', cidr: '192.0.2.192/27', parent_id: 8 },
    ]
  },
  // Добавьте дополнительные сети и подсети по аналогии
];

// Функция для добавления новой сети и её подсетей
async function createNetwork(network) {
  try {
    // Добавляем основную сеть
    const response = await axios.post(apiUrl, {
      name: network.name,
      cidr: network.cidr,
      parent_id: network.parent_id
    });

    console.log(`Сеть ${network.name} успешно добавлена:`, response.data);
    
    // Добавляем подсети
    for (let subnet of network.subnets) {
      const subnetResponse = await axios.post(apiUrl, {
        name: subnet.name,
        cidr: subnet.cidr,
        parent_id: response.data.id // Используем ID только что добавленной сети как parent_id для подсетей
      });

      console.log(`Подсеть ${subnet.name} успешно добавлена:`, subnetResponse.data);
    }
  } catch (error) {
    if (error.response) {
      // Ошибка от сервера API
      console.error('Ошибка:', error.response.data);
    } else {
      // Ошибка сети или запроса
      console.error('Ошибка запроса:', error.message);
    }
  }
}

// Вызов функции для добавления сетей и подсетей
async function createNetworks() {
  for (let network of networks) {
    await createNetwork(network);
  }
}

// Запуск функции для создания сетей
createNetworks();
