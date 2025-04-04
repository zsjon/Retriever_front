import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import Sidebar from "../components/Sidebar";
import "../css/page/MainDashboard.css";
import useFetchNewTelegramChannels from "../hooks/useFetchNewTelegramChannels";
import useFetchNewSlangData from "../hooks/useFetchNewSlangData";
import useFetchNewPosts from "../hooks/useFetchNewPosts";
import useFetchChannelCount from "../hooks/useFetchChannelCount";
import useFetchPostDetails from "../hooks/useFetchPostDetails";

const RankList = ({ title, items, link }) => {
    const isNew = (date) => {
        const today = new Date();
        const createdDate = new Date(date);
        const diffTime = Math.abs(today - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Difference in days
        return diffDays <= 3;
    };

    return (
        <div className="rank-card">
            <h3>{title}</h3>
            <ul>
                {items.map((item, index) => (
                    <li key={index} className="rank-item">
                        <span className="rank-number">{index + 1}</span>
                        <div className="rank-content">
                            <p className="rank-title">{item.name}</p>
                            <p className="rank-detail">{item.detail}</p>
                        </div>
                        {isNew(item.createdAt) && <span className="rank-new">NEW</span>}
                    </li>
                ))}
            </ul>
            <a href={link} className="view-link">
                전체 목록 확인
            </a>
        </div>
    );
};

const MainDashboard = () => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const { posts } = useFetchPostDetails(); // 불러오기
    const [monthlyPostData, setMonthlyPostData] = useState(Array(12).fill(0));

    const { channels: newTelegramChannels } = useFetchNewTelegramChannels(4);
    const { slangData: newSlangData } = useFetchNewSlangData(4);
    const { posts: newPosts } = useFetchNewPosts(4);
    const { channelCount } = useFetchChannelCount();

    const [weeklyChannelCount, setWeeklyChannelCount] = useState(0);
    const [weeklyPostCount, setWeeklyPostCount] = useState(0);

    // Utility function to calculate weekly count
    const getWeeklyCount = (data) => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // 7 days ago

        return data.filter((item) => new Date(item.createdAt) >= oneWeekAgo).length;
    };

    useEffect(() => {
        if (newTelegramChannels.length) {
            setWeeklyChannelCount(getWeeklyCount(newTelegramChannels));
        }
        if (newPosts.length) {
            setWeeklyPostCount(getWeeklyCount(newPosts));
        }
    }, [newTelegramChannels, newPosts]);

    useEffect(() => {
        if (posts.length) {
            const counts = getMonthlyPostCount(posts, 2024);
            setMonthlyPostData(counts);
        }
    }, [posts]);

    const getMonthlyPostCount = (posts, year) => {
        const monthlyCounts = Array(12).fill(0); // 12개월 초기화

        posts.forEach((post) => {
            if (!post.updatedAt) return;
            const date = new Date(post.updatedAt);
            const postYear = date.getFullYear();
            const month = date.getMonth(); // 0부터 시작 (0 = 1월)

            if (postYear === year) {
                monthlyCounts[month]++;
            }
        });

        return monthlyCounts;
    };

    useEffect(() => {
        if (!posts.length) return;

        // 월별 개수 계산
        const monthlyCounts = Array(12).fill(0);
        posts.forEach((post) => {
            const updatedAt = new Date(post.updatedAt);
            if (updatedAt.getFullYear() === 2024) {
                const month = updatedAt.getMonth(); // 0~11
                monthlyCounts[month]++;
            }
        });

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(chartRef.current, {
            type: "bar",
            data: {
                labels: [
                    "1월", "2월", "3월", "4월", "5월", "6월",
                    "7월", "8월", "9월", "10월", "11월", "12월"
                ],
                datasets: [
                    {
                        label: "월별 신규 게시글 감지 수",
                        data: monthlyCounts,
                        backgroundColor: "rgba(75, 192, 192, 0.6)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: "top"
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            precision: 0
                        }
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [posts]);

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="main">
                <header className="header">
                    <h1>실시간 거래 현황</h1>
                    <button className="download">Download</button>
                </header>

                <section className="statistics-chart">
                    <div className="statistics">
                        <div className="card">
                            <h3>주간 신규 탐지 채널</h3>
                            <p>{weeklyChannelCount}</p>
                        </div>
                        <div className="card">
                            <h3>주간 신규 탐지 포스트</h3>
                            <p>{weeklyPostCount}</p>
                        </div>
                        <div className="card">
                            <h3>총 탐지 채널</h3>
                            <p>{channelCount}</p>
                        </div>
                        <div className="card">
                            <h3>전월 대비 홍보 게시글 증가율</h3>
                            <p>+64%</p>
                        </div>
                        <div className="card">
                            <h3>전월 대비 거래 채널 증가율</h3>
                            <p>86%</p>
                        </div>
                        <div className="card">
                            <h3>월간 최다 거래 지역</h3>
                            <p className="p">서울시 강남구</p>
                        </div>
                    </div>
                    <div className="chart">
                        <canvas ref={chartRef}></canvas>
                    </div>
                </section>

                <section className="tables">
                    <RankList title="신규 텔레그램 채널" items={newTelegramChannels} link="/channels" />
                    <RankList title="신규 탐지 게시글" items={newPosts} link="/posts" />
                    <RankList title="신규 탐지 은어" items={newSlangData} link="/statistics" />
                </section>
            </main>
        </div>
    );
};

export default MainDashboard;
