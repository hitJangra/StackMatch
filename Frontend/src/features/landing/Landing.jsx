import React from 'react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, FileText, Search } from 'lucide-react';
import StackMatchLogo from '../../components/StackMatchLogo';
import { useTheme } from '../theme/theme.context';
import { Sun, Moon } from 'lucide-react';

const Landing = () => {
    const { theme, toggleTheme } = useTheme();
    const reduceMotion = useReducedMotion();
    const entrance = reduceMotion
        ? { initial: false }
        : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

    return (
        <div className="landing">
            <nav className="landing-nav" aria-label="Primary navigation">
                <Link className="landing-brand" to="/" aria-label="StackMatch home">
                    <StackMatchLogo />
                </Link>
                <div className="landing-nav-actions">
                    <button
                        type="button"
                        className="theme-icon"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    <Link className="landing-login" to="/login">Log in</Link>
                    <Link className="btn btn-primary landing-cta" to="/register">Get started</Link>
                </div>
            </nav>

            <main>
                <section className="landing-hero" aria-labelledby="hero-title">
                    <motion.div
                        className="hero-copy"
                        {...entrance}
                        transition={{ duration: reduceMotion ? 0 : 0.55, ease: 'easeOut' }}
                    >
                        <h1 id="hero-title">Find the role your resume fits.</h1>
                        <p>Match your resume to real jobs and save applications worth your time.</p>
                        <div className="hero-actions">
                            <Link className="btn btn-primary" to="/register">
                                Start matching
                                <ArrowRight size={18} />
                            </Link>
                            <Link className="btn btn-secondary" to="/login">Log in</Link>
                        </div>
                    </motion.div>

                    <motion.div
                        className="hero-preview"
                        {...entrance}
                        transition={{ duration: reduceMotion ? 0 : 0.65, delay: reduceMotion ? 0 : 0.08, ease: 'easeOut' }}
                        aria-label="StackMatch resume match preview"
                    >
                        <div className="preview-topbar">
                            <span>Resume match</span>
                            <span className="preview-status">Ready</span>
                        </div>
                        <div className="preview-body">
                            <div className="preview-document">
                                <FileText size={22} />
                                <div>
                                    <strong>Product Designer.pdf</strong>
                                    <span>Resume uploaded</span>
                                </div>
                            </div>
                            <div className="match-row">
                                <div>
                                    <span>Keyword coverage</span>
                                    <strong>Strong</strong>
                                </div>
                                <div className="match-track"><span /></div>
                            </div>
                            <div className="keyword-list">
                                <span><Check size={14} /> Product strategy</span>
                                <span><Check size={14} /> User research</span>
                                <span><Check size={14} /> Figma</span>
                            </div>
                        </div>
                    </motion.div>
                </section>

                <section className="landing-bento" aria-label="Product preview">
                    <div className="bento-card bento-score interactive-card">
                        <div className="bento-card-head">
                            <span>Resume signal</span>
                            <FileText size={20} />
                        </div>
                        <h2>See what hiring systems notice.</h2>
                        <div className="score-lines" aria-label="Resume analysis preview">
                            <div><span>Skills</span><span className="score-bar"><span /></span></div>
                            <div><span>Experience</span><span className="score-bar"><span /></span></div>
                            <div><span>Keywords</span><span className="score-bar"><span /></span></div>
                        </div>
                    </div>

                    <div className="bento-card bento-search interactive-card">
                        <div className="bento-card-head">
                            <span>Job matches</span>
                            <Search size={20} />
                        </div>
                        <div className="job-match">
                            <div className="job-mark">AT</div>
                            <div>
                                <strong>Senior Product Designer</strong>
                                <span>Atlas Studio</span>
                            </div>
                            <span className="match-pill">Good fit</span>
                        </div>
                        <div className="job-match">
                            <div className="job-mark">NW</div>
                            <div>
                                <strong>Design Systems Lead</strong>
                                <span>Northwind</span>
                            </div>
                            <span className="match-pill">Good fit</span>
                        </div>
                    </div>

                    <div className="bento-card bento-forest wise-beam-border">
                        <span>From match to interview</span>
                        <h2>Turn a strong fit into a focused plan.</h2>
                        <Link className="forest-link" to="/register">
                            Create your match
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Landing;
