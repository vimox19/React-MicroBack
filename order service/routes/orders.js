const OrderItem = require("../models/order-item");
const Order = require("../models/order");
const express = require("express");
const router = express.Router();
const axios = require('axios');
require("dotenv/config");


const GATEWAY_URL = process.env.GATEWAY_URL;



router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ dateOrdered: -1 }).lean();
        const populatedOrders = await Promise.all(orders.map(async order => {
            try {
                const userResponse = await axios.get(`${GATEWAY_URL}/users/${order.user}`);
                const user = userResponse.data;
                const orderItems = await Promise.all(order.orderItems.map(async orderItemId => {
                    try {
                        const orderItem = await OrderItem.findById(orderItemId).lean();
                        const productResponse = await axios.get(`${GATEWAY_URL}/products/${orderItem.product}`);
                        const product = productResponse.data;
                        return {
                            ...orderItem,
                            product
                        };
                    } catch (error) {
                        console.error('Error fetching order item data:', error);
                        return null;
                    }
                }));
                return {
                    ...order,
                    user,
                    orderItems: orderItems.filter(item => item !== null)
                };
            } catch (error) {
                console.error('Error fetching user data:', error);
                return null;
            }
        }));
        const validOrders = populatedOrders.filter(order => order !== null);
        res.json(validOrders);
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId).lean();
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        const userResponse = await axios.get(`${GATEWAY_URL}/users/${order.user}`);
        const user = userResponse.data;
        const orderItems = await Promise.all(order.orderItems.map(async orderItemId => {
            const orderItem = await OrderItem.findById(orderItemId).lean();
            const productResponse = await axios.get(`${GATEWAY_URL}/products/${orderItem.product}`);
            const product = productResponse.data;
            return {
                ...orderItem,
                product
            };
        }));
        const populatedOrder = {
            ...order,
            user,
            orderItems
        };
        res.json(populatedOrder);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


router.post('/', async (req, res) => {
    try {
        const orderData = req.body;

        const orderItems = await Promise.all(
            orderData.orderItems.map(async (orderItem) => {
                const newOrderItem = new OrderItem({
                    product: orderItem.product,
                    quantity: orderItem.quantity
                });

                const savedOrderItem = await newOrderItem.save();
                return savedOrderItem._id;
            })
        );

        const order = new Order({
            orderItems: orderItems,
            shippingAddress: orderData.shippingAddress,
            phone: orderData.phone,
            status: 'Pending',
            totalPrice: 0,
            user: orderData.user,
            dateOrdered: new Date()
        });

        const savedOrder = await order.save();

        res.status(201).json(savedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.put("/:id", async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status,
        },
        { new: true }
    );
    if (!order) return res.status(400).send("la commande ne peut pas être modifiée!");
    res.send(order);
});


router.delete("/:id", (req, res) => {
    Order.findByIdAndRemove(req.params.id)
        .then(async (order) => {
            if (order) {
                await order.orderItems.map(async (orderItem) => {
                    await OrderItem.findByIdAndRemove(orderItem);
                });
                return res.status(200).send("la commande a été supprimée")
            } else {
                return res.status(404).send("la commande n'a pas été trouvée");
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});


router.get(`/get/count`, async (req, res) => {
    const orderCount = await Order.countDocuments((count) => count)

    if (!orderCount) {
        res.status(500).send("le nombre des commandes ne peut pas être calculé");
    }
    res.send({
        orderCount: orderCount
    });
})


module.exports = router;
